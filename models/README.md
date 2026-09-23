# Kokoro-82M Local Neural TTS Models

This folder holds the ONNX model files for local text-to-speech inference.

### Required Files
* `kokoro-v1.0.onnx`: The ONNX model graph (~340 MB)
* `voices-v1.0.bin`: Pre-computed voice embeddings (~28 MB)

### Download Instructions
You can download the model weights directly from HuggingFace:
```bash
# Kokoro v1.0 ONNX model
curl -L -o models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx

# Voice vectors
curl -L -o models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

Alternatively, if the model files are not present, the pipeline falls back gracefully to `edge-tts`.
