<template>
  <div class="chat">
    <h2><span @click="gotoHome">💬</span> Socket.io {{ $t("chat.navTitle") }}</h2>

    <div class="status">
      {{ $t("chat.status") }}：
      <span class="green" v-if="connected">{{ $t("chat.connected") }}</span>
      <span class="red" v-else>{{ $t("chat.disconnected") }}</span>
    </div>

    <div class="user-info" v-if="connected">
      {{ $t("chat.currentUser") }}：{{ username }}
    </div>

    <div class="msg-box" ref="msgBox">
      <div
        v-for="(item, idx) in msgList"
        :key="idx"
        class="msg"
        :class="{
          self: item.username === username,
          system: item.type === 'system',
        }"
      >
        <div class="info" v-if="item.type !== 'system'">
          <span class="name">{{ item.username }}</span>
          <span class="time">{{ item.time }}</span>
        </div>
        <div class="content">{{ item.displayContent }}</div>
      </div>
    </div>

    <div class="input-box" v-if="connected">
      <input v-model="msg" :placeholder="$t('chat.inputMessage')" @keyup.enter="send" />
      <button @click="send">{{ $t("chat.send") }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import socket from "@/utils/socket";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
// 消息类型
interface ChatMessage {
  type: "user" | "system";
  username: string;
  content: string;
  displayContent: string;
  time: string;
  isStreaming: boolean;
}

// 消息列表类型
const msgList = ref<ChatMessage[]>([]);
const msgBox = ref<HTMLElement | null>(null);
const connected = ref<boolean>(false);
const username = ref<string>(t("chat.guest") + " " + Date.now().toString().slice(-4));
const msg = ref<string>("");

const gotoHome = (): void => {
  window.location.href = "/";
};

onMounted(() => {
  // 连接成功事件
  socket.on("connect", () => {
    connected.value = true;
    socket.emit("join", username.value);
  });

  // 接收聊天消息
  socket.on(
    "chat message",
    (data: { username: string; content: string; time?: string }) => {
      const newMessage: ChatMessage = {
        type: "user",
        username: data.username,
        content: data.content,
        displayContent: "",
        time: data.time || new Date().toLocaleTimeString(),
        isStreaming: true,
      };
      const messageIndex = msgList.value.push(newMessage) - 1;
      scrollToBottom();
      // 启动流式显示
      streamMessageContent(messageIndex, data.content);
    }
  );

  // 用户加入事件
  socket.on("user joined", (username: string) => {
    const content = `${username} ${t("chat.joined")}`;
    const systemMessage: ChatMessage = {
      type: "system",
      username: t("chat.system"),
      content: content,
      displayContent: "",
      time: new Date().toLocaleTimeString(),
      isStreaming: true,
    };
    const messageIndex = msgList.value.push(systemMessage) - 1;
    scrollToBottom();
    // 启动流式显示
    streamMessageContent(messageIndex, content);
  });

  // 用户离开事件
  socket.on("user left", () => {
    const content = `${t("chat.left")}`;
    const systemMessage: ChatMessage = {
      type: "system",
      username: t("chat.system"),
      content: content,
      displayContent: "",
      time: new Date().toLocaleTimeString(),
      isStreaming: true,
    };
    const messageIndex = msgList.value.push(systemMessage) - 1;
    scrollToBottom();
    // 启动流式显示
    streamMessageContent(messageIndex, content);
  });

  // 断开连接事件
  socket.on("disconnect", () => {
    connected.value = false;
  });
});

// 发送消息
const send = (): void => {
  if (!msg.value.trim()) return;

  const message = {
    username: username.value,
    content: msg.value,
    time: new Date().toLocaleTimeString(),
  };

  socket.emit("chat message", message);
  msg.value = "";
};

// 滚动到底部
const scrollToBottom = (): void => {
  nextTick(() => {
    if (msgBox.value) {
      msgBox.value.scrollTop = msgBox.value.scrollHeight;
    }
  });
};

// 流式显示消息内容
const streamMessageContent = (messageIndex: number, content: string): void => {
  let index = 0;
  const interval = setInterval(() => {
    if (index < content.length) {
      msgList.value[messageIndex].displayContent = content.substring(0, index + 1);
      index++;
      scrollToBottom();
    } else {
      clearInterval(interval);
      msgList.value[messageIndex].isStreaming = false;
    }
  }, 50); // 每 50 毫秒显示一个字符
};

// 清理事件监听
onUnmounted(() => {
  socket.off("connect");
  socket.off("chat message");
  socket.off("user joined");
  socket.off("user left");
  socket.off("disconnect");
});
</script>

<style scoped>
.chat {
  max-width: 600px;
  margin: 10px auto;
  padding: 20px;
}
.status {
  margin: 10px 0;
}
.green {
  color: #07c160;
}
.red {
  color: #f53f3f;
}
.user-info {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}
.msg-box {
  height: 400px;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 15px;
  overflow-y: auto;
  background: #fafafa;
}

/* 自定义滚动条 一个短一些窄一些的滚动条 */
.msg-box::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.msg-box::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 2px;
}
.msg-box::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
.msg-box::-webkit-scrollbar-thumb:hover {
  background: #999;
}
.msg {
  margin-bottom: 12px;
  max-width: 70%;
}
.self {
  margin-left: auto;
  text-align: right;
}
.system {
  margin: 0 auto 12px;
  text-align: center;
  max-width: 80%;
}
.info {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 10px;
}
.self .info {
  justify-content: flex-end;
}
.content {
  background: #e3f2fd;
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 4px;
  word-break: break-all;
}
.self .content {
  background: #d3eafd;
}
.system .content {
  background: #fff3cd;
  color: #856404;
  font-size: 13px;
  padding: 6px 10px;
}
.input-box {
  margin-top: 15px;
  display: flex;
  gap: 10px;

  input:nth-child(1) {
    flex: 1;
  }
  input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
  }
  button {
    padding: 0 20px;
    background: #07c160;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
}

h2 span:hover {
  cursor: pointer;
}
</style>
