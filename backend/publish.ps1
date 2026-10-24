# Usage in PowerShell:
#   .\publish.ps1 -z <Module>
# Or dot-source once per PowerShell session:
#   . .\publish.ps1
#   yt -z <Module>
# Modules: MediaConvert, Video, Upload, Social, Transcode

function Invoke-YuhTubePublish {
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Module
    )

    $backendDir = $PSScriptRoot
    if ([string]::IsNullOrWhiteSpace($backendDir)) {
        $backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    }
    if ([string]::IsNullOrWhiteSpace($backendDir)) {
        $backendDir = Get-Location
    }

    $projectName = switch -Regex ($Module) {
        '^(MediaConvert|mediaconvert)$' { 'YuhTube.MediaConvertCoordinator' }
        '^(Video|video)$'               { 'YuhTube.Video.Api' }
        '^(Upload|upload)$'             { 'YuhTube.Upload.Api' }
        '^(Social|social)$'             { 'YuhTube.Social.Api' }
        '^(Transcode|transcode|TranscodeStatusUpdater)$' { 'YuhTube.TranscodeStatusUpdater' }
        Default {
            Write-Error "Unknown project: $Module. Use MediaConvert, Video, Upload, Social, or Transcode."
            return
        }
    }

    $lambdaCmd = Get-Command "dotnet-lambda" -ErrorAction SilentlyContinue
    if (-not $lambdaCmd) {
        $userToolsPath = Join-Path $env:USERPROFILE ".dotnet\tools\dotnet-lambda.exe"
        if (Test-Path $userToolsPath) {
            $lambdaCmd = $userToolsPath
        } else {
            Write-Error "Amazon.Lambda.Tools is unavailable. Install it with: dotnet tool install -g Amazon.Lambda.Tools"
            return
        }
    } else {
        $lambdaCmd = $lambdaCmd.Source
    }

    $projectDir = Join-Path $backendDir "src\$projectName"
    $publishDir = Join-Path $backendDir "publish"
    $outputPackage = Join-Path $publishDir "$projectName.zip"

    if (-not (Test-Path $publishDir)) {
        New-Item -ItemType Directory -Path $publishDir -Force | Out-Null
    }

    Push-Location $projectDir
    try {
        & $lambdaCmd package --configuration Release --framework net10.0 --output-package $outputPackage
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Created $outputPackage" -ForegroundColor Green
        } else {
            Write-Error "Packaging failed with exit code $LASTEXITCODE."
        }
    } finally {
        Pop-Location
    }
}

function yt {
    param(
        [Parameter(Mandatory = $false)]
        [switch]$z,
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Module
    )
    Invoke-YuhTubePublish -Module $Module
}

# Allow direct script execution: .\publish.ps1 -z Transcode
if ($args.Count -gt 0) {
    if ($args[0] -eq "-z" -and $args.Count -ge 2) {
        yt -z $args[1]
    } elseif ($args.Count -ge 2 -and $args[1] -eq "build") {
        Invoke-YuhTubePublish -Module $args[0]
    } elseif ($args.Count -eq 1) {
        Invoke-YuhTubePublish -Module $args[0]
    }
}
