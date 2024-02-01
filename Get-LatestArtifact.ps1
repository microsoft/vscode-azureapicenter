# Download the latest artifact from a GitHub Actions workflow
# Assumption: The GitHub CLI (gh) is installed and authenticated
Param(
    [string]
    [Parameter(Mandatory = $false)]
    $OutFile = "release-apicenter-{{artifact_id}}.zip",

    [switch]
    [Parameter(Mandatory = $false)]
    $Help
)

function Show-Usage {
    Write-Output "    This downloads the latest artifact from a GitHub Actions workflow

    Usage: $(Split-Path $MyInvocation.ScriptName -Leaf) ``
            [-OutFIle <File path to download>] ``

            [-Help]

    Options:
        -OutFile    File path to download. Default is `release-apicenter-{{artifact_id}}.zip`.
        -Help:      Show this message.
"

    Exit 0
}

# Show usage
$needHelp = $Help -eq $true
if ($needHelp -eq $true) {
    Show-Usage
    Exit 0
}

$result = gh api repos/microsoft/vscode-azureapicenter/actions/artifacts | ConvertFrom-Json
$artifactId = $result.artifacts[0].id
$url = $result.artifacts[0].archive_download_url
$token = gh auth token

Invoke-RestMethod -Uri $url -Headers @{ Authorization = "Bearer $token" } -OutFile $($OutFile -replace "{{artifact_id}}", $artifactId)
