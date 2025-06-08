# 定义文件路径
SOURCE="CONTRIBUTORS.md"
TARGET="index.md"
OUTPUT="temp.md"  # 使用 temp.md 来保存合并后的文件

# 插入到第 52 行
LINE=53

# 拆分 + 拼接
head -n $((LINE - 1)) "$TARGET" > "$OUTPUT"  # 获取前 51 行
tail -n +$LINE "$TARGET" >> "$OUTPUT"  # 获取从第 52 行开始的内容

# 使用 sed 替换特定的 Markdown 内容
# 将 <div> 到 </div> 标签之间的内容替换为 CONTRIBUTORS.md 文件的内容
sed -i '/<div style="display: flex; flex-wrap: wrap;">/,/<\/div>/{
  r CONTRIBUTORS.md
  d
}' "$OUTPUT"

#!/bin/bash

# Define the file paths
SOURCE="index.md"
TEMP_FILE="temp_index.md"

# Backup the original file
cp "$SOURCE" "$SOURCE.bak"

# Define the new contributors HTML block
new_contributors='
<div style="display: flex; flex-wrap: wrap;">
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/93558445?v=4" alt="Wuyule123" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/109359652?v=4" alt="innsn" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/214280146?v=4" alt="SDUCSGuide" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/88531871?v=4" alt="Mowalen" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/115643176?v=4" alt="yao-wu-yang" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/54179862?v=4" alt="Dregen-Yor" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/118536009?v=4" alt="MagicDBH" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/39123432?v=4" alt="SuperGoodGame" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/93507387?v=4" alt="lalayouyi" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/95868242?v=4" alt="yanyao14" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/94169263?v=4" alt="haoma2772" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/211297369?v=4" alt="Senzhan9" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/112069559?v=4" alt="JJJohnsen1" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/48880277?v=4" alt="sphcode" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
  <div style="margin: 2px;">
    <a>
      <img src="https://avatars.githubusercontent.com/u/110225796?v=4" alt="yeshengjv" style="width: 50px; height: 50px; border-radius: 50%;"/>
    </a>
  </div>
</div>'

# Use sed to replace the existing contributors div in the index.md file
sed "/<div style=\"display: flex; flex-wrap: wrap;\">/,/<\/div>/c\\
$new_contributors" "$SOURCE" > "$TEMP_FILE"

# Replace the original file with the modified one
mv "$TEMP_FILE" "$SOURCE"

