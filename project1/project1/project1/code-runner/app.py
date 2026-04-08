from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import subprocess
import tempfile
import os
import sys
import time

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

@app.route('/run', methods=['POST'])
def run_code():
    try:
        data = request.json
        language = data.get('language', 'python')
        code = data.get('code', '')
        input_data = data.get('input', '')
        
        if language == 'python':
            return run_python(code, input_data)
        elif language == 'java':
            return run_java(code, input_data)
        elif language == 'cpp':
            return run_cpp(code, input_data)
        else:
            return jsonify({'error': 'Unsupported language'})
            
    except Exception as e:
        return jsonify({'error': str(e)})

def run_python(code, input_data):
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            f.flush()
            
            process = subprocess.run(
                [sys.executable, f.name],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=5
            )
            
            os.unlink(f.name)
            
            if process.returncode == 0:
                return jsonify({'output': process.stdout})
            else:
                return jsonify({'error': process.stderr})
    except Exception as e:
        return jsonify({'error': str(e)})
                
@app.route('/execute', methods=['POST'])
def execute_code():
    try:
        code = request.json.get('code', '')
        user_input = request.json.get('input', '')
        if not code.strip():
            return jsonify({'error': 'No code provided'})
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Execute with timeout and input
            result = subprocess.run(
                [sys.executable, temp_file],
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
            # Clean up
            if os.path.exists(temp_file):
                os.unlink(temp_file)
                
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Code execution timed out (10s limit)'})
    except Exception as e:
        return jsonify({'error': f'Execution error: {str(e)}'})

def run_java(code, input_data):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            java_file = os.path.join(temp_dir, 'Solution.java')
            with open(java_file, 'w') as f:
                f.write(code)
            
            compile_process = subprocess.run(
                ['javac', java_file],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if compile_process.returncode != 0:
                return jsonify({'error': compile_process.stderr})
            
            run_process = subprocess.run(
                ['java', '-cp', temp_dir, 'Solution'],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if run_process.returncode == 0:
                return jsonify({'output': run_process.stdout})
            else:
                return jsonify({'error': run_process.stderr})
                
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Code execution timed out'})
    except Exception as e:
        return jsonify({'error': str(e)})

def run_cpp(code, input_data):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            cpp_file = os.path.join(temp_dir, 'solution.cpp')
            exe_file = os.path.join(temp_dir, 'solution.exe')
            
            with open(cpp_file, 'w') as f:
                f.write(code)
            
            compile_process = subprocess.run(
                ['g++', cpp_file, '-o', exe_file],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if compile_process.returncode != 0:
                return jsonify({'error': compile_process.stderr})
            
            run_process = subprocess.run(
                [exe_file],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if run_process.returncode == 0:
                return jsonify({'output': run_process.stdout})
            else:
                return jsonify({'error': run_process.stderr})
                
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Code execution timed out'})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)