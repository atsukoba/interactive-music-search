from src.utils import env
from src.api import app
from src.db import QueryDataSelector, create_engine

if __name__ == "__main__":

    QueryDataSelector.set_engine()

    app.run(host="0.0.0.0",
            port=env.get("APP_SERVER_PORT", 8000),
            debug=env.get("DEBUG", False))
