from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all models"""
    
    def __repr__(self):
        return f"<{self.__class__.__name__}>"
