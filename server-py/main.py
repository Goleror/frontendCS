from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine
from app.models.base import Base
from app.routes import router

# Create all database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="NewArch Backend",
    description="Python backend API for NewArch game",
    version="1.0.0",
    debug=settings.debug,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "newarch-backend"}


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to NewArch Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    import socket
    
    # Get local IP for network access
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except:
        local_ip = "localhost"
    
    print(f"\n{'='*70}")
    print(f"🚀 NewArch Backend Server Starting")
    print(f"{'='*70}")
    print(f"🌐 Local:     http://localhost:{settings.port}")
    print(f"🌐 Network:   http://{local_ip}:{settings.port}")
    print(f"📚 API Docs:  http://localhost:{settings.port}/docs")
    print(f"💚 Health:    http://localhost:{settings.port}/health")
    print(f"{'='*70}\n")
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
