param(
  [int]$Port = 4173
)

$projectRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$contentTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".svg"  = "image/svg+xml"
}

try {
  $listener.Start()
  Write-Host "ELU Live is running at http://localhost:$Port/"
  Write-Host "Press Ctrl+C to stop."
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $buffer = [byte[]]::new(8192)
    $read = $stream.Read($buffer, 0, $buffer.Length)
    $request = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $read)
    $requestLine = ($request -split "`r?`n")[0]
    $requestTarget = ($requestLine -split " ")[1]
    $requestPath = ($requestTarget -split "\?")[0]
    $relativePath = [System.Uri]::UnescapeDataString($requestPath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = "index.html" }
    $candidate = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $relativePath))
    if (-not [System.IO.File]::Exists($candidate) -and $relativePath -notmatch '\.[A-Za-z0-9]+$') {
      $candidate = Join-Path $projectRoot "index.html"
    }
    if (-not $candidate.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($candidate)) {
      $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $header = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n")
      $stream.Write($header, 0, $header.Length)
      $stream.Write($body, 0, $body.Length)
      $stream.Close()
      $client.Close()
      continue
    }
    $extension = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
    $contentType = if ($contentTypes.ContainsKey($extension)) { $contentTypes[$extension] } else { "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($candidate)
    $header = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n")
    $stream.Write($header, 0, $header.Length)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
    $client.Close()
  }
}
finally {
  $listener.Stop()
}
