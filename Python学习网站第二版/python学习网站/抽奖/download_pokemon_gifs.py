#!/usr/bin/env python3
# download_pokemon_gifs.py
import requests
import os
import time

print("🎮 宝可梦GIF下载工具")
print("=" * 50)

# 获取当前目录
current_dir = os.path.dirname(os.path.abspath(__file__))
print(f"当前目录: {current_dir}")

# 精灵ID列表
pokemon_ids = [25, 4, 7, 1, 133, 39, 52, 129, 10, 16, 26, 5, 8, 2, 134, 136, 135, 55, 130, 59, 131, 143, 149, 144, 145, 146, 150]

def create_folder():
    folder_name = "pokemon_gifs"
    folder_path = os.path.join(current_dir, folder_name)
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        print(f"✅ 创建文件夹: {folder_path}")
    return folder_path

def download_pokemon():
    folder_path = create_folder()
    print(f"开始下载 {len(pokemon_ids)} 个精灵...")
    print("-" * 50)
    
    success_count = 0
    
    for pokemon_id in pokemon_ids:
        print(f"下载 ID {pokemon_id:3d}... ", end="", flush=True)
        
        try:
            # 先尝试GIF
            gif_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/{pokemon_id}.gif"
            response = requests.get(gif_url, timeout=10)
            
            if response.status_code == 200:
                with open(f"{folder_path}/{pokemon_id}.gif", 'wb') as f:
                    f.write(response.content)
                print("✅ GIF")
                success_count += 1
            else:
                # GIF失败，尝试PNG
                png_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon_id}.png"
                response = requests.get(png_url, timeout=10)
                
                if response.status_code == 200:
                    with open(f"{folder_path}/{pokemon_id}.png", 'wb') as f:
                        f.write(response.content)
                    print("📄 PNG")
                    success_count += 1
                else:
                    print("❌ 失败")
        except Exception as e:
            print(f"❌ 错误: {e}")
        
        time.sleep(0.3)  # 避免请求过快
    
    print("-" * 50)
    print(f"\n🎉 下载完成!")
    print(f"成功下载: {success_count}/{len(pokemon_ids)} 个精灵")
    print(f"文件保存在: {folder_path}")
    print("\n📋 使用说明:")
    print("1. 修改 companion.js 中的 getPokemonImage() 函数")
    print("2. 使用本地路径: 'pokemon_gifs/25.gif'")
    print("3. 刷新HTML页面测试")

if __name__ == "__main__":
    try:
        import requests
        download_pokemon()
    except ImportError:
        print("❌ 需要安装requests库")
        print("运行: python3 -m pip install requests --user")
        print("然后重新运行此脚本")
