# Production Issues & Notes

## ⚠️ CRITICAL: Ephemeral Storage Issue

**Problem**: Railway has ephemeral filesystem. All files in `/models/` are **deleted on every deployment/restart**.

**Current Impact**: 
- All trained ML models are lost when Railway restarts
- Users will always fall back to heuristic prediction
- Models DON'T persist across deployments

**Solution Options**:

### Option A: Use Railway Persistent Volumes (Recommended)
```yaml
# Contact Railway support to enable persistent volumes
# This keeps /models/ folder across restarts
```

### Option B: Upload Models to Cloud Storage (Most Robust)
```python
# Add to app.py:
import boto3  # AWS S3
from google.cloud import storage  # Google Cloud Storage

# On save_model(): upload to S3/GCS
# On load_model(): download from S3/GCS
```

### Option C: Accept Heuristic-Only (Simplest, Least Accurate)
- Just use rule-based predictions (no ML training)
- Delete the `/models/` folder
- Remove train endpoint

---

## ✅ Fixed in This Update

1. **CORS Support** - Added flask-cors to allow backend to call this service
2. **Input Validation** - All endpoints validate userId and games array
3. **Error Handling** - Consistent error responses with proper HTTP codes
4. **Gunicorn Ready** - Procfile correctly uses `gunicorn app:app`
5. **Requirements Updated** - Added flask-cors dependency

---

## 🚀 Deployment Checklist

- [ ] Models storage solution chosen (Railway volumes OR Cloud storage)
- [ ] Environment variables set on Railway:
  - `ML_PORT=5001`
  - `LOG_LEVEL=INFO`
  - `MODEL_DIR=/mnt/persistent_volume/models` (if using Railway volumes)
- [ ] Backend configured to call `https://ml-service-url.railway.app/predict`
- [ ] Test endpoint: `curl https://ml-service-url.railway.app/health`

---

## 📊 Testing Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py

# Test prediction
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "games": [
      {"gameId": "memory", "score": 8, "level": 1, "timePlayed": 45},
      {"gameId": "memory", "score": 9, "level": 1, "timePlayed": 42}
    ]
  }'

# Test training
curl -X POST http://localhost:5001/train \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "games": [...]
  }'

# Test health
curl http://localhost:5001/health
```

---

## 🔧 Production Deployment (Railway)

1. Set environment variables in Railway dashboard
2. If using Cloud storage: Add credentials (AWS_ACCESS_KEY_ID, etc.)
3. Deploy: git push → Railway auto-builds and runs Procfile
4. Monitor logs: Railway dashboard → Logs tab
