<template>
  <VerticalLayout>
    <b-row>
      <b-col xl="12">
        <UIComponentCard id="quill-snow-editor" title="Snow Editor">
          <div class="mt-3">
            <textarea
              class="form-control h-100"
              style="min-height: 300px"
              v-model="taskDetail"
            ></textarea>
          </div>
        </UIComponentCard>
        <UIComponentCard id="quill-bubble-editor" title="Bubble Editor">
          <div class="mt-3">
            <textarea
              class="form-control h-100"
              style="min-height: 300px"
              v-model="taskDetail"
            ></textarea>
          </div>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import { ref } from 'vue';
import UIComponentCard from '@/components/UIComponentCard.vue';

const taskDetail = ref(`<h3><span class="ql-size-large">Hello World!</span></h3>
      <h3>This is a simple editable area.</h3>
      - Select a text to reveal the toolbar.
      - Edit rich document on-the-fly, so elastic!
      <span ><b>End of simple area</b></span>`);
</script>
