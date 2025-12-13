#!/usr/bin/env python3
# 改进版下载脚本
import requests
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

print("🎮 宝可梦GIF下载工具（镜像版）")
print("=" * 50)

current_dir = os.path.dirname(os.path.abspath(__file__))
folder_path = os.path.join(current_dir, "pokemon_gifs")
os.makedirs(folder_path, exist_ok=True)

# 精灵ID列表
pokemon_ids = [25, 4, 7, 1, 133, 39, 52, 129, 10, 16, 26, 5, 8, 2, 134, 136, 135, 55, 130, 59, 131, 143, 149, 144, 145, 146, 150]

# 多个镜像源
MIRRORS = [
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon",
    "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon",
    "https://github.com/PokeAPI/sprites/raw/master/sprites/pokemon",
    "https://gitlab.com/PokeAPI/sprites/-/raw/master/sprites/pokemon"
]

def download_single(pokemon_id):
    """下载单个精灵"""
    print(f"  ID {pokemon_id:3d}: ", end="", flush=True)
    
    # 先尝试GIF
    urls = []
    for mirror in MIRRORS:
        urls.append(f"{mirror}/versions/generation-v/black-white/animated/{pokemon_id}.gif")
    
    # 再尝试PNG
    for mirror in MIRRORS:
        urls.append(f"{mirror}/{pokemon_id}.png")
    
    for url in urls:
        try:
            # 设置较长的超时时间
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                # 确定文件扩展名
                ext = '.gif' if 'animated' in url else '.png'
                filepath = os.path.join(folder_path, f"{pokemon_id}{ext}")
                
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                print(f"✅ {ext}", flush=True)
                return True
        except requests.exceptions.Timeout:
            continue
        except requests.exceptions.RequestException:
            continue
        except Exception as e:
            continue
    
    print("❌", flush=True)
    return False

def download_with_threads():
    """使用多线程下载"""
    print(f"开始下载 {len(pokemon_ids)} 个精灵...")
    print("-" * 50)
    
    success_count = 0
    max_workers = 3  # 减少并发数，避免被ban
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 提交所有下载任务
        future_to_id = {executor.submit(download_single, pid): pid for pid in pokemon_ids}
        
        # 处理完成的任务
        for future in as_completed(future_to_id):
            pid = future_to_id[future]
            try:
                if future.result():
                    success_count += 1
            except Exception:
                print(f"  ID {pid:3d}: ❌ 异常")
    
    return success_count

def main():
    print(f"下载目录: {folder_path}")
    print("正在连接镜像源...")
    
    # 先测试网络连接
    try:
        test_url = "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/25.png"
        response = requests.get(test_url, timeout=10)
        if response.status_code != 200:
            print("⚠️  网络测试失败，但继续尝试...")
    except:
        print("⚠️  网络连接可能有问题，继续尝试...")
    
    # 开始下载
    success_count = download_with_threads()
    
    print("-" * 50)
    print(f"\n🎉 下载完成!")
    print(f"成功: {success_count}/{len(pokemon_ids)}")
    
    # 列出下载的文件
    print("\n📁 已下载的文件:")
    files = os.listdir(folder_path)
    files.sort(key=lambda x: int(x.split('.')[0]) if x.split('.')[0].isdigit() else 0)
    for f in files:
        print(f"  {f}")
    
    # 如果没有下载到任何文件，提供备用方案
    if success_count == 0:
        print("\n⚠️  所有下载都失败了！")
        print("请尝试:")
        print("1. 检查网络连接")
        print("2. 使用VPN/代理")
        print("3. 手动下载: https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon")
        print("4. 或联系我获取打包文件")

if __name__ == "__main__":
    try:
        import requests
        main()
    except ImportError:
        print("请安装requests: python3 -m pip install requests")
