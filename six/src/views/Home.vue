<template>
  <div class="home">
    <MyInfo msg="Welcome to MyInfo"/>
  </div>
</template>

<script>
import MyInfo from '@/components/MyInfo.vue'

export default {
  name: 'Home',
  components: {
    MyInfo
  }
}
</script>
