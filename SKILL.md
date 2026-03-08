# Voice Speak - 让 AI Agent 语音讲话

让 OpenClaw 可以语音说话提醒主人，并通过 Telegram、X、Discord 等平台发送语音消息。

> ⚡ 基于 OpenAI TTS，声音自然流畅！

## 特色

- 🎤 **自然语音** - 使用 OpenAI TTS，声音清晰自然
- 🦞 **萌系风格** - 默认使用活泼可爱的声线
- 📱 **多平台支持** - Telegram、X、Discord
- 🔔 **智能提醒** - Agent 可主动触发语音提醒
- 🌐 **矩阵推广** - 一键全平台广播

## 工具

### tts - 语音播放/发送

把文字转换成语音并播放或发送。

**参数:**
- `text` (必填): 要说的话
- `channel` (可选): 发送频道
  - `telegram` - 发送到 Telegram
  - `discord` - 发送到 Discord
  - `x` / `twitter` - 发送到 X (即将支持)
  - `all` - 发送到所有平台
  - 不填则只本地播放
- `voice` (可选): 声音风格
  - `nova` - 活泼女声 ⭐默认
  - `shimmer` - 温柔可爱的女声
  - `fable` - 故事感男声
  - `onyx` - 成熟男声
  - `alloy` - 中性声音

**使用示例:**
```
tts: 你有新的邮件
tts: 主人，该休息了
tts(text=会议将在10分钟后开始, channel=telegram)
tts(text=推广消息, channel=all, voice=nova)
```

## 声音风格

推荐使用以下语音风格:
- `nova` - 活泼女声 ⭐推荐
- `shimmer` - 温柔可爱的女声
- `fable` - 故事感男声
- `onyx` - 成熟男声
- `alloy` - 中性声音

## 触发场景

Agent 可以主动触发语音提醒:
- 📧 重要通知 (邮件、会议、消息)
- ✅ 需要确认 (决策需要主人同意)
- 🚨 紧急情况 (系统错误、安全警报)
- ⏰ 定时提醒 (喝水、运动、休息)
- 💕 情感交互 (早安、晚安、关心)
- 📢 营销推广 (广播、活动、新品)

## 多平台矩阵

### Telegram
- 支持发送语音 + 文字 caption
- 可设置群发列表

### Discord (即将支持)
- 支持语音频道播放
- 支持文字 + 语音消息

### X/Twitter (即将支持)
- 语音推文
- 语音 DM

## 商业应用

- 🎯 **语音营销** - 批量发送推广语音
- 📢 **品牌广播** - 全平台矩阵推广
- 🤖 **客服自动化** - 语音回复
- 📱 **通知提醒** - 重要事件语音通知

## 安装

1. 确保已配置 OPENAI_API_KEY
2. 配置各平台 Bot Token (见下方)
3. 直接使用内置的 `tts` 工具即可

## 配置

环境变量:
- `OPENAI_API_KEY` - OpenAI API Key (必需)
- `TELEGRAM_BOT_TOKEN` - Telegram Bot Token
- `TELEGRAM_CHAT_ID` - Telegram 聊天 ID
- `DISCORD_BOT_TOKEN` - Discord Bot Token
- `X_API_KEY` - X/Twitter API Key

## 注意事项

- 本地播放会让周围的人都能听到
- 发送需要网络连接
- 建议设置触发规则避免过度打扰
- 遵守各平台 API 使用规范
