from src.utils import env
from src.api import app

if __name__ == "__main__":
    app.run(host="127.0.0.1",
            port=env.get("APP_SERVER_PORT", 8000),
            debug=env.get("DEBUG", False))
