import AppKit
import Foundation
import PDFKit

func padded(_ value: Int, digits: Int = 3) -> String {
  String(format: "%0\(digits)d", value)
}

guard CommandLine.arguments.count >= 5 else {
  fputs("Usage: render-pdf-pages.swift <input-pdf> <output-dir> <basename> <target-width> [jpeg-quality]\n", stderr)
  exit(1)
}

let inputPath = CommandLine.arguments[1]
let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
let basename = CommandLine.arguments[3]
let targetWidth = CGFloat(Double(CommandLine.arguments[4]) ?? 1200)
let jpegQuality = CGFloat(Double(CommandLine.arguments.dropFirst(5).first ?? "0.82") ?? 0.82)

let fileManager = FileManager.default
try fileManager.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

guard let document = PDFDocument(url: URL(fileURLWithPath: inputPath)) else {
  fputs("Could not open PDF at \(inputPath)\n", stderr)
  exit(1)
}

for pageIndex in 0..<document.pageCount {
  guard let page = document.page(at: pageIndex) else { continue }

  let pageBounds = page.bounds(for: .mediaBox)
  let scale = targetWidth / pageBounds.width
  let targetSize = NSSize(width: pageBounds.width * scale, height: pageBounds.height * scale)

  let image = NSImage(size: targetSize)
  image.lockFocus()
  NSColor.white.setFill()
  NSBezierPath(rect: NSRect(origin: .zero, size: targetSize)).fill()

  guard let context = NSGraphicsContext.current?.cgContext else {
    image.unlockFocus()
    fputs("Missing graphics context for page \(pageIndex + 1)\n", stderr)
    exit(1)
  }

  context.saveGState()
  context.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: context)
  context.restoreGState()
  image.unlockFocus()

  guard
    let tiffData = image.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiffData),
    let jpegData = bitmap.representation(using: .jpeg, properties: [.compressionFactor: jpegQuality])
  else {
    fputs("Could not encode page \(pageIndex + 1)\n", stderr)
    exit(1)
  }

  let fileURL = outputDirectory.appendingPathComponent("\(basename)-\(padded(pageIndex + 1)).jpg")
  try jpegData.write(to: fileURL)
  print(fileURL.path)
}
