from backend import app

@app.route('/api/test')
def hello_world():
  return 'Hello, Backend!'
