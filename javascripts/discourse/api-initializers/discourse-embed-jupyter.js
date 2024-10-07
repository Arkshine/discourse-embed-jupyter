import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.13.0", (api) => {
  window.I18n.translations[window.I18n.locale].js.composer.jupyter_sample = ``;

  function applyJuptyer(element, key) {
    const jupyterElements = element.querySelectorAll(
      "pre[data-code-wrap=jupyter]"
    );

    if (!jupyterElements.length) {
      return;
    }

    jupyterElements.forEach((jupyterElement, index) => {
      if (jupyterElement.dataset.processed) {
        return;
      }

      const jupyterId = `jupyter_${index}_${key}`;

      if (!jupyterElement.dataset.codePath) {
        return;
      }

      if (jupyterElement.dataset.codeHeight) {
        jupyterElement.style.height = `${jupyterElement.dataset.codeHeight}px`;
      }

      jupyterElement.dataset.processed = true;
      jupyterElement.setAttribute("id", jupyterId);

      let url = `${settings.source_url}/${jupyterElement.dataset.codePath}.ipynb`;
      if (settings.source_token) {
        url = `${url}?token=${settings.source_token}`;
      }

      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.width = "100%";
      iframe.height = jupyterElement.style.height || settings.iframe_height;
      iframe.style.border = "1px solid var(--primary-400)";

      jupyterElement.innerHTML = iframe.outerHTML;
    });
  }

  if (["toolbar", "both"].includes(settings.composer_icon_location)) {
    api.onToolbarCreate((toolbar) => {
      toolbar.addButton({
        title: themePrefix("insert_jupyter"),
        id: "insertJupyter",
        group: "insertions",
        icon: "jupyter",
        perform: (toolbarEvent) =>
          toolbarEvent.applySurround(
            "\n```jupyter path= \n",
            "\n```\n",
            "jupyter_sample",
            { multiline: false }
          ),
      });
    });
  }

  if (["popup menu", "both"].includes(settings.composer_icon_location)) {
    api.addComposerToolbarPopupMenuOption({
      icon: "jupyter",
      label: themePrefix("insert_jupyter"),
      action: (toolbarEvent) => {
        toolbarEvent.applySurround(
          "\n```jupyter path= \n",
          "\n```\n",
          "jupyter_sample",
          { multiline: false }
        );
      },
    });
  }

  if (api.decorateChatMessage) {
    api.decorateChatMessage((element) => {
      applyJuptyer(element, `chat_message_${element.id}`);
    });
  }
  api.decorateCookedElement(async (element, helper) => {
    const key = helper ? `post_${helper.getModel().id}` : "composer";
    applyJuptyer(element, key);
  });
});
