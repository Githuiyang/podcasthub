"""导入 Excel 原始数据到数据库

用法: python import_data.py
"""
import sys
from pathlib import Path

# 确保 backend 目录在 path 中
sys.path.insert(0, str(Path(__file__).resolve().parent))

from models.database import SessionLocal, Studio, init_db
from services.studio_pricing import infer_charging_method


def import_studios():
    """导入录音间数据"""
    try:
        import openpyxl
    except ImportError:
        print("需要安装 openpyxl: pip install openpyxl")
        return

    # 初始化数据库
    init_db()

    # 读取 Excel
    excel_path = Path("/Users/lihuiyang/Desktop/录音间原始数据表.xlsx")
    if not excel_path.exists():
        print(f"文件不存在: {excel_path}")
        return

    wb = openpyxl.load_workbook(excel_path)
    ws = wb.active

    db = SessionLocal()
    try:
        count = 0
        for row in ws.iter_rows(min_row=2, values_only=True):
            _, city, name, address, usage_info, open_hours, equipment = row

            if not name:
                continue

            # 解析使用形式中的价格和预约方式
            booking_note = ""
            price_per_hour = None
            price_note = ""

            if usage_info:
                usage_str = str(usage_info)
                # 提取价格
                import re
                prices = re.findall(r'(\d+)r/h', usage_str)
                if not prices:
                    prices = re.findall(r'(\d+)/h', usage_str)
                if prices:
                    price_per_hour = int(prices[0])

                # 预约方式
                if "免费" in usage_str:
                    price_note = "免费"
                elif "收费" in usage_str:
                    price_note = "收费"

                # 预约说明
                booking_note = usage_str

            # 解析设备
            equipment_list = []
            if equipment:
                equipment_list = [e.strip() for e in str(equipment).replace('，', ',').replace('；', ',').split(',') if e.strip()]

            # 解析地址提取区域
            district = ""
            if address:
                import re
                district_match = re.search(r'市(\w+?区)', str(address))
                if district_match:
                    district = district_match.group(1)

            # 检查是否已存在
            existing = db.query(Studio).filter(Studio.name == name).first()
            if existing:
                print(f"  跳过（已存在）: {name}")
                continue

            studio = Studio(
                name=name,
                city=city or "上海",
                district=district,
                address=address,
                description=f"开放时间: {open_hours or '详见预约信息'}",
                equipment=equipment_list if equipment_list else None,
                room_count=1,
                price_per_hour=price_per_hour,
                price_note=price_note or None,
                charging_method=infer_charging_method(price_note, price_per_hour, None),
                booking_note=booking_note or None,
                tags=["播客录音室"] if "录音室" in str(row[0]) else ["播客空间"],
                is_active=True,
            )
            db.add(studio)
            count += 1
            print(f"  导入: {name} ({city} {district})")

        db.commit()
        print(f"\n导入完成: 新增 {count} 条录音间数据")
    except Exception as e:
        print(f"导入失败: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    import_studios()
