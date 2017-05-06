export const getPanelTemplate = function getPanelTemplate(templateString) {
  return `
  <div class="gallery-curve-wrapper">
    <div class="gallery-header">
      <span>{{ title }}</span>
      <p class="caption">{{ description }}</p>
    </div>
    <div class="gallery-body">
      <div class="title-wrapper">
        <h4>{{ title }}</h4>
      </div>
      <div class="content" v-if="isActive">
        ${ templateString }
      </div>
    </div>
  </div>`
};