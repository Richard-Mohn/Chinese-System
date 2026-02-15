param(
  [string]$RootPath = "C:\Users\richa\projects\Mohn_Empire",
  [string]$ManifestPath = "C:\Users\richa\projects\Mohn_Empire\MohnMenu\scripts\module-copy-manifest.json",
  [string]$DestinationPath = "C:\Users\richa\projects\Mohn_Empire\MODULE_COPY_STAGING",
  [switch]$Execute
)

$ErrorActionPreference = "Stop"

function Resolve-PatternFiles {
  param(
    [string]$ProjectRoot,
    [string]$Pattern
  )

  $fullPattern = Join-Path $ProjectRoot $Pattern
  $baseDir = Split-Path -Path $fullPattern -Parent
  if (-not (Test-Path $baseDir)) {
    return @()
  }

  $leaf = Split-Path -Path $fullPattern -Leaf
  if ($leaf -match "[\*\?]") {
    return Get-ChildItem -Path $baseDir -Recurse -File -Filter $leaf -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -notmatch "node_modules|\\.next|dist|build|coverage|tmp" }
  }

  if (Test-Path $fullPattern) {
    return ,(Get-Item $fullPattern)
  }

  return @()
}

if (-not (Test-Path $ManifestPath)) {
  throw "Manifest not found: $ManifestPath"
}

$manifest = Get-Content -Path $ManifestPath -Raw | ConvertFrom-Json
if (-not $manifest.modules) {
  throw "Manifest has no modules array"
}

if (-not (Test-Path $DestinationPath)) {
  New-Item -Path $DestinationPath -ItemType Directory | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$auditRows = New-Object System.Collections.Generic.List[object]
$totalPlanned = 0

Write-Host "Mode:" ($(if ($Execute) { "EXECUTE" } else { "DRY-RUN" })) -ForegroundColor Cyan
Write-Host "Root: $RootPath"
Write-Host "Destination: $DestinationPath"

foreach ($module in $manifest.modules) {
  Write-Host "`n=== Module: $($module.id) ===" -ForegroundColor Yellow

  foreach ($source in $module.sources) {
    $projectRoot = Join-Path $RootPath $source.project
    if (-not (Test-Path $projectRoot)) {
      Write-Warning "Project path not found: $projectRoot"
      continue
    }

    foreach ($pattern in $source.patterns) {
      $files = Resolve-PatternFiles -ProjectRoot $projectRoot -Pattern $pattern
      if (-not $files -or $files.Count -eq 0) {
        continue
      }

      foreach ($file in $files) {
        $relative = $file.FullName.Substring($projectRoot.Length).TrimStart('\\')
        $targetDir = Join-Path $DestinationPath "$($module.id)\\$($source.project)\\$(Split-Path $relative -Parent)"
        $targetFile = Join-Path $DestinationPath "$($module.id)\\$($source.project)\\$relative"

        $auditRows.Add([PSCustomObject]@{
          Timestamp = $timestamp
          ModuleId = $module.id
          Project = $source.project
          SourceFile = $file.FullName
          TargetFile = $targetFile
          SizeBytes = $file.Length
          SHA256 = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash
          Mode = $(if ($Execute) { "COPY" } else { "DRY-RUN" })
        }) | Out-Null

        if ($Execute) {
          if (-not (Test-Path $targetDir)) {
            New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
          }
          Copy-Item -Path $file.FullName -Destination $targetFile -Force
        }

        $totalPlanned++
      }
    }
  }
}

$auditFile = Join-Path $DestinationPath "copy-audit-$timestamp.csv"
$auditRows | Export-Csv -Path $auditFile -NoTypeInformation

Write-Host "`nCompleted. Files planned: $totalPlanned" -ForegroundColor Green
Write-Host "Audit report: $auditFile" -ForegroundColor Green
Write-Host "Source repos were not modified." -ForegroundColor Green
