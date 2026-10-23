#!/usr/bin/env bash

# Source this file once per shell, then run:
#   yt -z <Module>
# Modules: MediaConvert, Video, Upload, Social, Transcode

if [[ -n "${ZSH_VERSION:-}" ]]; then
  _YUHTUBE_BACKEND_DIR="${${(%):-%x}:A:h}"
else
  _YUHTUBE_BACKEND_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
fi

yuhtube() {
  if [[ $# -ne 2 || "$2" != "build" ]]; then
    printf 'Usage: yuhtube {MediaConvert|Video|Upload|Social|Transcode} build\n' >&2
    return 2
  fi

  local project_name project_dir output_package
  local -a lambda_command
  case "$1" in
    MediaConvert|mediaconvert)
      project_name="YuhTube.MediaConvertCoordinator"
      ;;
    Video|video)
      project_name="YuhTube.Video.Api"
      ;;
    Upload|upload)
      project_name="YuhTube.Upload.Api"
      ;;
    Social|social)
      project_name="YuhTube.Social.Api"
      ;;
    Transcode|transcode|TranscodeStatusUpdater)
      project_name="YuhTube.TranscodeStatusUpdater"
      ;;
    *)
      printf 'Unknown project: %s (use MediaConvert, Video, Upload, Social, or Transcode)\n' "$1" >&2
      return 2
      ;;
  esac

  if command -v dotnet-lambda >/dev/null 2>&1; then
    lambda_command=(dotnet-lambda)
  elif [[ -x "${HOME:-}/.dotnet/tools/dotnet-lambda" ]]; then
    lambda_command=("${HOME}/.dotnet/tools/dotnet-lambda")
  else
    printf 'Amazon.Lambda.Tools is unavailable. Install it with: dotnet tool install -g Amazon.Lambda.Tools\n' >&2
    return 1
  fi

  project_dir="$_YUHTUBE_BACKEND_DIR/src/$project_name"
  output_package="$_YUHTUBE_BACKEND_DIR/publish/$project_name.zip"
  mkdir -p "$_YUHTUBE_BACKEND_DIR/publish"

  (cd "$project_dir" && "${lambda_command[@]}" package \
    --configuration Release \
    --framework net10.0 \
    --output-package "$output_package") || return $?

  printf 'Created %s\n' "$output_package"
}

yt() {
  if [[ $# -ne 2 || "$1" != "-z" ]]; then
    printf 'Usage: yt -z {MediaConvert|Video|Upload|Social|Transcode}\n' >&2
    return 2
  fi

  yuhtube "$2" build
}

# Also allow direct use: bash backend/publish.sh Video build
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  if [[ "$1" == "-z" ]]; then
    yt "$@"
  else
    yuhtube "$@"
  fi
fi
