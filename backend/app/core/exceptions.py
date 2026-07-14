"""Application-level exceptions."""

from fastapi import HTTPException, status


class StudySafeError(Exception):
    """Base application error."""

    def __init__(self, message: str, code: str = "app_error") -> None:
        self.message = message
        self.code = code
        super().__init__(message)


class AuthenticationError(StudySafeError):
    pass


class AuthorizationError(StudySafeError):
    pass


class NotFoundError(StudySafeError):
    pass


class ValidationError(StudySafeError):
    pass


def http_error(exc: StudySafeError) -> HTTPException:
    status_map = {
        AuthenticationError: status.HTTP_401_UNAUTHORIZED,
        AuthorizationError: status.HTTP_403_FORBIDDEN,
        NotFoundError: status.HTTP_404_NOT_FOUND,
        ValidationError: status.HTTP_422_UNPROCESSABLE_ENTITY,
    }
    return HTTPException(
        status_code=status_map.get(type(exc), status.HTTP_400_BAD_REQUEST),
        detail={"code": exc.code, "message": exc.message},
    )
