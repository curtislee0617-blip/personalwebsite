import AppKit
import Foundation
import Vision

guard CommandLine.arguments.count >= 3 else {
  fputs("Usage: recognize-cookbook-images.swift <input-dir> <output-dir>\n", stderr)
  exit(1)
}

let inputDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
let fileManager = FileManager.default

try fileManager.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

let imageURLs = try fileManager
  .contentsOfDirectory(at: inputDirectory, includingPropertiesForKeys: nil)
  .filter { ["jpg", "jpeg", "png"].contains($0.pathExtension.lowercased()) }
  .sorted {
    $0.lastPathComponent.localizedStandardCompare($1.lastPathComponent) == .orderedAscending
  }

for imageURL in imageURLs {
  autoreleasepool {
    guard
      let image = NSImage(contentsOf: imageURL),
      let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil)
    else {
      fputs("Could not read \(imageURL.path)\n", stderr)
      return
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    request.recognitionLanguages = ["en-GB"]
    request.minimumTextHeight = 0.006

    do {
      try VNImageRequestHandler(cgImage: cgImage, options: [:]).perform([request])
      let observations = (request.results ?? []).sorted { first, second in
        let verticalDelta = abs(first.boundingBox.midY - second.boundingBox.midY)
        if verticalDelta > 0.012 {
          return first.boundingBox.midY > second.boundingBox.midY
        }
        return first.boundingBox.minX < second.boundingBox.minX
      }

      let lines = observations.compactMap { observation -> String? in
        guard let candidate = observation.topCandidates(1).first else { return nil }
        let box = observation.boundingBox
        return String(
          format: "%.4f\t%.4f\t%.4f\t%.4f\t%@",
          box.minX,
          box.minY,
          box.width,
          box.height,
          candidate.string
        )
      }

      let outputURL = outputDirectory.appendingPathComponent(imageURL.deletingPathExtension().lastPathComponent + ".tsv")
      try lines.joined(separator: "\n").write(to: outputURL, atomically: true, encoding: .utf8)
      print(outputURL.path)
    } catch {
      fputs("Recognition failed for \(imageURL.path): \(error)\n", stderr)
    }
  }
}
