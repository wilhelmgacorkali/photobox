$port = 8080
$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
    $listener.Start()
} catch {
    $port = 8081
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
    $listener.Start()
}

$url = "http://localhost:$port/"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SNAPBOX Photobooth Server Berjalan!    " -ForegroundColor Green
Write-Host "   URL : $url" -ForegroundColor Yellow
Write-Host "   Tekan Ctrl + C untuk menutup server    " -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan

try {
    Start-Process $url -ErrorAction SilentlyContinue
} catch {}

$buffer = New-Object byte[] 8192

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $stream.ReadTimeout = 3000
        $stream.WriteTimeout = 5000

        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        if ($bytesRead -le 0) {
            $client.Close()
            continue
        }

        $requestStr = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
        $requestLine = $requestStr.Split("`n")[0].Trim()
        $parts = $requestLine.Split(" ")

        $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
        $cleanPath = $rawPath.Split("?")[0].TrimStart("/")
        if ([string]::IsNullOrWhiteSpace($cleanPath)) {
            $cleanPath = "index.html"
        }
        $cleanPath = [System.Uri]::UnescapeDataString($cleanPath).Replace('/', '\')
        $localFile = [System.IO.Path]::Combine($root, $cleanPath)

        if ([System.IO.File]::Exists($localFile)) {
            $ext = [System.IO.Path]::GetExtension($localFile).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".htm"  { "text/html; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".mjs"  { "application/javascript; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".webp" { "image/webp" }
                ".ico"  { "image/x-icon" }
                ".mp3"  { "audio/mpeg" }
                ".wav"  { "audio/wav" }
                ".json" { "application/json" }
                default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($localFile)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1>")
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/html; charset=utf-8`r`nContent-Length: $($notFound.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($notFound, 0, $notFound.Length)
        }

        $stream.Flush()
        $client.Close()
    } catch {
        # ignore connection glitches
    }
}
