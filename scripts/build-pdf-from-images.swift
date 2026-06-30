import AppKit
import Foundation

guard CommandLine.arguments.count >= 3 else {
  fputs("Usage: build-pdf-from-images.swift <input-dir> <output-pdf>\n", stderr)
  exit(1)
}

let inputDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
let fileManager = FileManager.default

let imageURLs = try fileManager
  .contentsOfDirectory(at: inputDirectory, includingPropertiesForKeys: nil)
  .filter { ["jpg", "jpeg", "png"].contains($0.pathExtension.lowercased()) }
  .sorted { first, second in
    first.lastPathComponent.localizedStandardCompare(second.lastPathComponent) == .orderedAscending
  }

guard let firstImageURL = imageURLs.first, let firstImage = NSImage(contentsOf: firstImageURL) else {
  fputs("No readable images found in \(inputDirectory.path)\n", stderr)
  exit(1)
}

let firstSize = firstImage.size
var mediaBox = CGRect(origin: .zero, size: CGSize(width: firstSize.width, height: firstSize.height))

guard let context = CGContext(outputURL as CFURL, mediaBox: &mediaBox, nil) else {
  fputs("Could not create PDF context\n", stderr)
  exit(1)
}

for imageURL in imageURLs {
  guard let image = NSImage(contentsOf: imageURL) else { continue }
  let imageSize = image.size
  var pageBox = CGRect(origin: .zero, size: CGSize(width: imageSize.width, height: imageSize.height))

  context.beginPDFPage([kCGPDFContextMediaBox as String: pageBox] as CFDictionary)

  let targetRect = CGRect(origin: .zero, size: pageBox.size)
  let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil)

  if let cgImage {
    context.draw(cgImage, in: targetRect)
  }

  context.endPDFPage()
}

context.closePDF()
print(outputURL.path)
