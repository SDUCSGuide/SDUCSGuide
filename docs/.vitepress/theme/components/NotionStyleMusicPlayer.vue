<template>
    <div class="music-player" :style="style">
      <div class="info">
        <p class="title">{{ title }}</p>
        <p class="artist">{{ artist }}</p>
      </div>
      <audio v-if="musicSrc" controls class="audio-player">
        <source :src="musicSrc" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  
  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    artist: {
      type: String,
      required: true
    },
    cover: {
      type: String,
      required: true
    },
    musicSrc: {
      type: String,
      required: true
    },
    style: {
      type: [String, Object],
      default: () => 'margin: 20px auto;'
    }
  })
  </script>
  
  <style scoped>
  .music-player {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%; 
    max-width: 800px;
    margin: 20px auto;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .cover img {
    width: 60px; /* 缩小封面图尺寸 */
    height: 60px; 
    border-radius: 8px;
    object-fit: cover;
    margin-bottom: 10px;
  }
  
  .info {
    text-align: center;
    width: 90%; /* 内容宽度稍微窄一些 */
  }
  
  .title {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin: 5px 0;
  }
  
  .artist {
    font-size: 12px;
    color: #777;
    margin: 0;
  }
  
  .audio-player {
    width: 100%;
    max-width: 400px; /* 限制播放器宽度 */
    margin-top: 10px;
  }
  </style>
  