from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import subprocess
import sys
import os
import tempfile
import shutil

app = Flask(__name__)
CORS(app)

LANGUAGE_CONFIG = {
    "python": {
        "suffix": ".py",
        "compile_cmd": None,
        "run_cmd": lambda source, _: [sys.executable, source],
    },
    "javascript": {
        "suffix": ".js",
        "compile_cmd": None,
        "run_cmd": lambda source, _: ["node", source],
    },
    "c": {
        "suffix": ".c",
        "compile_cmd": lambda source, output: ["gcc", source, "-o", output],
        "run_cmd": lambda _, output: [output],
    },
    "cpp": {
        "suffix": ".cpp",
        "compile_cmd": lambda source, output: ["g++", source, "-o", output],
        "run_cmd": lambda _, output: [output],
    },
    "java": {
        "suffix": ".java",
        "compile_cmd": lambda source, _: ["javac", source],
        "run_cmd": lambda source, _: ["java", "-cp", tempfile.gettempdir(), os.path.splitext(os.path.basename(source))[0]],
    },
}


def missing_executable(command):
    if not command:
        return None
    return command if shutil.which(command) is None else None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/execute', methods=['POST'])
def execute_code():
    try:
        code = request.json.get('code', '')
        user_input = request.json.get('input', '')
        language = request.json.get('language', 'python').lower()

        if language not in LANGUAGE_CONFIG:
            return jsonify({'error': f'Unsupported language: {language}'})

        if not code.strip():
            return jsonify({'error': 'No code provided'})

        config = LANGUAGE_CONFIG[language]
        suffix = config["suffix"]

        # Java needs class name = filename; use a fixed Main.java entrypoint
        if language == "java":
            temp_file = os.path.join(tempfile.gettempdir(), "Main.java")
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(code)
        else:
            with tempfile.NamedTemporaryFile(mode='w', suffix=suffix, delete=False, encoding="utf-8") as f:
                f.write(code)
                temp_file = f.name

        temp_output = tempfile.mktemp(suffix=".exe") if language in ("c", "cpp") else None

        try:
            compile_cmd_builder = config["compile_cmd"]
            run_cmd_builder = config["run_cmd"]

            if compile_cmd_builder:
                compile_cmd = compile_cmd_builder(temp_file, temp_output)
                missing = missing_executable(compile_cmd[0])
                if missing:
                    return jsonify({'error': f"Required compiler not found: {missing}"})

                compile_result = subprocess.run(
                    compile_cmd,
                    capture_output=True,
                    text=True,
                    timeout=10,
                    cwd=tempfile.gettempdir()
                )

                if compile_result.returncode != 0:
                    return jsonify({
                        'output': compile_result.stdout,
                        'error': compile_result.stderr or 'Compilation failed',
                        'returncode': compile_result.returncode
                    })

            run_cmd = run_cmd_builder(temp_file, temp_output)
            missing = missing_executable(run_cmd[0])
            if missing:
                return jsonify({'error': f"Required runtime not found: {missing}"})

            result = subprocess.run(
                run_cmd,
                input=user_input,
                capture_output=True,
                text=True,
                timeout=10,
                cwd=tempfile.gettempdir()
            )

            return jsonify({
                'output': result.stdout,
                'error': result.stderr,
                'returncode': result.returncode
            })

        finally:
            # Clean up temporary files
            if language != "java" and os.path.exists(temp_file):
                os.unlink(temp_file)
            if temp_output and os.path.exists(temp_output):
                os.unlink(temp_output)
            if language == "java":
                class_file = os.path.join(tempfile.gettempdir(), "Main.class")
                if os.path.exists(class_file):
                    os.unlink(class_file)
                
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Code execution timed out (10s limit)'})
    except Exception as e:
        return jsonify({'error': f'Execution error: {str(e)}'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)