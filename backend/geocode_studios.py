"""用高德 Web API 为录音间地址生成经纬度"""
import sys, os, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from dotenv import load_dotenv
load_dotenv()

AMAP_KEY = os.getenv("AMAP_WEB_KEY")

if not AMAP_KEY:
    print("未配置 AMAP_WEB_KEY")
    sys.exit(1)

import httpx
from models.database import SessionLocal, Studio

def geocode(address: str, city: str = "") -> tuple:
    """高德地理编码，返回 (longitude, latitude)"""
    url = "https://restapi.amap.com/v3/geocode/geo"
    params = {"key": AMAP_KEY, "address": address, "city": city}
    try:
        resp = httpx.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("geocodes") and len(data["geocodes"]) > 0:
            location = data["geocodes"][0]["location"]  # "121.xxxx,31.xxxx"
            lng, lat = location.split(",")
            return float(lng), float(lat)
    except Exception as e:
        print(f"  地理编码失败: {e}")
    return None, None

def main():
    print("使用现有 schema 执行地理编码；表结构变更请通过正式 migration 管理。")

    db = SessionLocal()
    studios = db.query(Studio).filter(Studio.address.isnot(None)).all()

    for studio in studios:
        if studio.longitude and studio.latitude:
            print(f"  跳过（已有坐标）: {studio.name}")
            continue

        # address 字段已经包含完整地址，直接使用
        full_address = studio.address or ""
        print(f"  编码: {studio.name} -> {full_address}")

        lng, lat = geocode(full_address, studio.city or "")
        if lng and lat:
            studio.longitude = lng
            studio.latitude = lat
            print(f"    -> ({lng}, {lat})")
        else:
            print(f"    -> 未找到坐标")

        time.sleep(0.2)  # 避免触发限流

    db.commit()
    db.close()
    print("\n地理编码完成")

if __name__ == "__main__":
    main()
