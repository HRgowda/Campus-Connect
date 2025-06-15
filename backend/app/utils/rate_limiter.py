from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from fastapi import Request
from starlette.status import HTTP_429_TOO_MANY_REQUESTS

# Create the limiter instance
limiter = Limiter(key_func=get_remote_address)

# Define the exception handler
def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": "Limit exceeded. Try again after 15 minutes."}
    )
