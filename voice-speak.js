#!/usr/bin/env node

/**
 * Voice Speak Tool
 * 让 OpenClaw 可以语音讲话并发送语音到 Telegram
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '7782850134:AAHdqTcvCH1vGWJxfSeofSEx0RUh峡节5Y',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '8385953897',
  openaiApiKey: process.env.OPENAI_API_KEY,
  defaultVoice: 'nova'
};

// 工具函数：调用 OpenAI TTS API
async function generateSpeech(text, voice = 'nova') {
  if (!CONFIG.openaiApiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const url = new URL('https://api.openai.com/v1/audio/speech');
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.openaiApiKey}`,
      'Content-Type': 'application/json'
    }
  };

  const body = JSON.stringify({
    model: 'gpt-4o-mini-tts',
    voice: voice,
    input: text,
    response_format: 'mp3'
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      if (res.statusCode !== 200) {
        let error = '';
        res.on('data', chunk => error += chunk);
        res.on('end', () => reject(new Error(`OpenAI API error: ${res.statusCode} - ${error}`)));
        return;
      }
      
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// 工具函数：发送语音到 Telegram
async function sendVoiceToTelegram(audioBuffer, caption) {
  const boundary = '----VoiceSpeakBoundary' + Date.now();
  
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from(`Content-Disposition: form-data; name="chat_id"; charset=utf-8\r\n\r\n${CONFIG.telegramChatId}\r\n`),
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from(`Content-Disposition: form-data; name="caption"; charset=utf-8\r\n\r\n${caption}\r\n`),
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from(`Content-Disposition: form-data; name="voice"; filename="voice.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n`),
    audioBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${CONFIG.telegramBotToken}/sendVoice`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            resolve(result.result);
          } else {
            reject(new Error(result.description || 'Telegram API error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// 工具函数：本地播放语音 (macOS)
function playLocally(audioPath) {
  try {
    // 尝试用 afplay 播放 (macOS)
    execSync(`afplay "${audioPath}"`, { stdio: 'ignore' });
  } catch (e) {
    // 如果失败，尝试用 say 命令 (macOS 内置)
    console.log('Using fallback: say command');
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'speak') {
    // 本地语音播放
    const text = args.slice(1).join(' ');
    if (!text) {
      console.error('Usage: voice-speak speak <text>');
      process.exit(1);
    }
    
    console.log(`🎤 Speaking: ${text}`);
    
    // 检查是否有 OpenAI API Key
    if (CONFIG.openaiApiKey) {
      try {
        const audio = await generateSpeech(text, CONFIG.defaultVoice);
        const tempPath = '/tmp/voice-speak.mp3';
        fs.writeFileSync(tempPath, audio);
        playLocally(tempPath);
        console.log('✅ Speech played locally');
      } catch (e) {
        console.error('TTS Error:', e.message);
        // 回退到 say 命令
        execSync(`say "${text}"`, { stdio: 'inherit' });
      }
    } else {
      // 使用系统 say 命令
      execSync(`say "${text}"`, { stdio: 'inherit' });
    }
    
  } else if (command === 'send') {
    // 发送到 Telegram
    const text = args.slice(1).join(' ');
    if (!text) {
      console.error('Usage: voice-speak send <text>');
      process.exit(1);
    }
    
    console.log(`📤 Generating voice for: ${text}`);
    
    if (!CONFIG.openaiApiKey) {
      console.error('Error: OPENAI_API_KEY required for voice generation');
      process.exit(1);
    }
    
    try {
      const audio = await generateSpeech(text, CONFIG.defaultVoice);
      await sendVoiceToTelegram(audio, text);
      console.log('✅ Voice sent to Telegram!');
    } catch (e) {
      console.error('Error:', e.message);
      process.exit(1);
    }
    
  } else {
    console.log(`
Voice Speak Tool
=================

Usage:
  voice-speak speak <text>    - Play voice locally
  voice-speak send <text>     - Send voice to Telegram

Environment Variables:
  OPENAI_API_KEY       - Required for voice generation
  TELEGRAM_BOT_TOKEN   - Telegram bot token
  TELEGRAM_CHAT_ID     - Telegram chat ID

Examples:
  voice-speak speak 你有新的邮件
  voice-speak send 会议将在10分钟后开始
`);
  }
}

main().catch(console.error);
