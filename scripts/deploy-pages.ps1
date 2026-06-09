$ErrorActionPreference = "Stop"

$projectName = "vgjdigital-card"
$branch = "main"
$repoRoot = Split-Path -Parent $PSScriptRoot
$tempRoot = [System.IO.Path]::GetTempPath()
$publishDir = Join-Path $tempRoot ("vgjdigital-card-pages-" + [guid]::NewGuid().ToString("N"))

$publicItems = @(
    "404.html",
    "index.html",
    "CNAME",
    "_headers",
    "robots.txt",
    "sitemap.xml",
    "assets",
    "velton",
    "judith",
    "neko",
    "kiana"
)

New-Item -ItemType Directory -Path $publishDir | Out-Null

try {
    foreach ($item in $publicItems) {
        $source = Join-Path $repoRoot $item
        if (-not (Test-Path -LiteralPath $source)) {
            throw "Missing public asset: $item"
        }

        Copy-Item -LiteralPath $source -Destination $publishDir -Recurse -Force
    }

    npx wrangler pages deploy $publishDir --project-name $projectName --branch $branch --commit-dirty=true
}
finally {
    $resolvedPublishDir = Resolve-Path -LiteralPath $publishDir -ErrorAction SilentlyContinue
    if ($resolvedPublishDir) {
        $resolvedTempRoot = [System.IO.Path]::GetFullPath($tempRoot)
        $resolvedPath = [System.IO.Path]::GetFullPath($resolvedPublishDir.Path)
        $folderName = Split-Path -Leaf $resolvedPath

        if ($resolvedPath.StartsWith($resolvedTempRoot, [StringComparison]::OrdinalIgnoreCase) -and
            $folderName.StartsWith("vgjdigital-card-pages-", [StringComparison]::OrdinalIgnoreCase)) {
            Remove-Item -LiteralPath $resolvedPath -Recurse -Force
        }
    }
}
