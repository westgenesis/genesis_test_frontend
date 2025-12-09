<script setup lang="ts">
import { onMounted, ref } from "vue";
import { http } from "../http";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { ElMessage } from "element-plus";
const logo = import.meta.env.VITE_APP_LOGO;

defineProps<{ msg: string }>();

const router = useRouter();
const email = ref("");
const password = ref("");
const rememberMe = ref(true);
const userStore = useUserStore();

const onSubmitFormData = async () => {
  const formData = {
    email: email.value,
    password: password.value,
    remember_me: rememberMe.value,
  };
  try {
    const res: any = await http.post("/auth/login", formData);
    if (res.status === "success") {
      window.localStorage.setItem("email", formData.email);
      if (formData.remember_me) {
        window.localStorage.setItem("password", formData.password);
      } else {
        window.localStorage.removeItem("password");
      }
      window.localStorage.setItem("token", res.access_token);
      userStore.updateEmail(formData.email);
      router.replace("/project/projectManage");
    } else {
      ElMessage.error("登录失败");
    }
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  const storedEmail = window.localStorage.getItem("email");
  const storedPassword = window.localStorage.getItem("password");
  if (storedEmail) {
    email.value = storedEmail;
  }
  if (storedEmail && storedPassword) {
    password.value = storedPassword;
  }
});
</script>

<template>
  <div
    class="login-form flex flex-1 flex-col items-center justify-center"
    style="height: 100vh"
  >
    <div class="particles">
      <span></span><span></span><span></span><span></span><span></span>
      <span></span><span></span><span></span><span></span><span></span>
    </div>
    <div class="form mt-8 min-w-[480px]">
      <div class="title">
        <div class="flex justify-center">
          <img :src="logo" class="h-[60px] w-[290px]" />
        </div>
        <div class="title-0 m-4 flex justify-center">
          <span class="title-welcome one-line-text max-w-[300px]">
            现代化的测试和用例管理工具
          </span>
        </div>
      </div>
      <form class="a-form">
        <div class="login-form-item">
          <el-input
            class="login-input"
            max-length="64"
            v-model="email"
            placeholder="请输入邮箱"
          />
        </div>
        <div class="login-form-item">
          <el-input
            v-model="password"
            type="password"
            class="login-password-input"
            placeholder="请输入密码"
            @keydown.enter="onSubmitFormData"
          />
        </div>
        <div class="flex">
          <el-checkbox v-model="rememberMe" label="记住密码"></el-checkbox>
        </div>

        <div class="mb-5 mt-3 flex-center">
          <el-button type="primary" @click="onSubmitFormData" class="w-[200px]">
            登录
          </el-button>
        </div>
      </form>
      <div class="mt-4 flex items-center justify-center">
        <div class="loginType flex cursor-pointer items-center justify-center">
          <svg-icon
            name="scan_code"
            width="18px"
            height="18px"
            class="text-[rgb(var(--primary-6))]"
          ></svg-icon>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.login-form {
  position: relative;
  overflow: hidden;

  /* 背景：渐变 + Mesh Light + 轻动效 */
  background: linear-gradient(135deg, #e9eef5, #ffffff);

  &::before {
    content: "";
    position: absolute;
    inset: -40%;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(86, 156, 214, 0.35),
      transparent 60%
    );
    filter: blur(60px);
    animation: meshMove 15s infinite linear;
    z-index: 0;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    inset: -30%;
    background: radial-gradient(
      circle at 70% 70%,
      rgba(120, 90, 255, 0.25),
      transparent 60%
    );
    filter: blur(80px);
    animation: meshMove2 18s infinite linear;
    z-index: 0;
    pointer-events: none;
  }

  .particles {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;

    span {
      position: absolute;
      width: 6px;
      height: 6px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
      animation: floatParticle 12s infinite ease-in-out;
    }

    span:nth-child(1) {
      left: 10%;
      top: 20%;
      animation-duration: 10s;
    }
    span:nth-child(2) {
      left: 25%;
      top: 40%;
      animation-duration: 12s;
    }
    span:nth-child(3) {
      left: 40%;
      top: 15%;
      animation-duration: 14s;
    }
    span:nth-child(4) {
      left: 60%;
      top: 30%;
      animation-duration: 11s;
    }
    span:nth-child(5) {
      left: 75%;
      top: 50%;
      animation-duration: 13s;
    }
    span:nth-child(6) {
      left: 20%;
      top: 70%;
      animation-duration: 15s;
    }
    span:nth-child(7) {
      left: 50%;
      top: 80%;
      animation-duration: 16s;
    }
    span:nth-child(8) {
      left: 70%;
      top: 20%;
      animation-duration: 14s;
    }
    span:nth-child(9) {
      left: 85%;
      top: 65%;
      animation-duration: 18s;
    }
    span:nth-child(10) {
      left: 30%;
      top: 85%;
      animation-duration: 17s;
    }
  }

  .title-welcome {
    color: rgb(var(--primary-5));
  }

  .form {
    z-index: 1;
    position: relative;
    background: #fff;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 8px 10px 0 #3232331a, 0 16px 24px 0 #3232330d,
      0 6px 30px 0 #3232330d;

    /* 卡片微光边框 */
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(
        135deg,
        rgba(86, 156, 214, 0.45),
        rgba(120, 90, 255, 0.45)
      );
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      pointer-events: none;
      opacity: 0.7;
    }

    .login-form-item {
      margin-bottom: 28px;
    }

    .loginType {
      margin: 0 8px;
      width: 32px;
      height: 32px;
      border: 1px solid var(--color-text-n8);
      border-radius: 50%;
    }
  }
}
:deep(.arco-divider-text) {
  padding: 0 8px !important;
}
.login-input {
  padding-right: 0;
  padding-left: 0;
  width: 400px;
  height: 36px;
}
.login-input :deep(.arco-input) {
  padding-right: 10px;
  padding-left: 10px;
}
.login-password-input {
  position: relative;
  padding-right: 0;
  padding-left: 0;
  width: 400px;
  height: 36px;
}
.login-password-input :deep(.arco-input) {
  padding-right: 50px;
  padding-left: 10px;
}
.login-password-input :deep(.arco-input-clear-btn) {
  position: absolute;
  top: 10px;
  float: right;
  margin-left: 350px;
}
.login-password-input :deep(.arco-input-suffix) {
  position: absolute;
  top: 10px;
  float: right;
  margin-left: 360px;
}
.flex-center {
  display: flex;
  justify-content: center;
}
@keyframes meshMove {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(10%, 10%) rotate(360deg);
  }
}
@keyframes meshMove2 {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(-10%, -10%) rotate(-360deg);
  }
}
@keyframes floatParticle {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-40px) scale(1.3);
    opacity: 0.6;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.9;
  }
}
</style>
