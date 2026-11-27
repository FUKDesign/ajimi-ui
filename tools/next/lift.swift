// Lifts the foreground subject of each image off its background using Vision.
import Vision
import CoreImage
import Foundation
let a = CommandLine.arguments
var i = 1
let ctx = CIContext()
while i + 1 < a.count {
  let ci = CIImage(contentsOf: URL(fileURLWithPath: a[i]))!
  let h = VNImageRequestHandler(ciImage: ci)
  let r = VNGenerateForegroundInstanceMaskRequest()
  try h.perform([r])
  guard let res = r.results?.first else { print("no subject", a[i]); i += 2; continue }
  let buf = try res.generateMaskedImage(ofInstances: res.allInstances, from: h, croppedToInstancesExtent: false)
  try ctx.writePNGRepresentation(of: CIImage(cvPixelBuffer: buf), to: URL(fileURLWithPath: a[i + 1]), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
  print("ok", a[i + 1], res.allInstances.count)
  i += 2
}
