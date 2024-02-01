#!/bin/bash

# Download the latest artifact from a GitHub Actions workflow
# Assumption: The GitHub CLI (gh) is installed and authenticated

set -e

function usage() {
    cat <<USAGE
    Usage: $0 <options>
    Options:
        [-of|--out-file]    File path to download.
                            Default: 'release-apicenter-<artifact_id>.zip'
        [-h|--help]         Show this message.
USAGE

    exit 1
}

out_file="release-apicenter-<artifact_id>.zip"

if [[ $# -eq 0 ]]; then
    out_file="release-apicenter-<artifact_id>.zip"
fi

while [[ "$1" != "" ]]; do
    case $1 in
    -of | --out-file)
        shift
        out_file=$1
        ;;

    -h | --help)
        usage
        exit 1
        ;;

    *)
        usage
        exit 1
        ;;
    esac

    shift
done

result=$(gh api repos/microsoft/vscode-azureapicenter/actions/artifacts)
artifact_id=$(echo $result | jq ".artifacts[0].id" -r)
url=$(echo $result | jq ".artifacts[0].archive_download_url" -r)
token=$(gh auth token)
out_file=$(echo $out_file | sed "s/<artifact_id>/$artifact_id/g")

curl -L $url -H "Authorization: Bearer $token" > $out_file
