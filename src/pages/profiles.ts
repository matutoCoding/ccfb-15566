// 宠物档案页:增删改、导入导出、选择当前宠物
import { App } from "../app";
import { BREEDS, BreedId } from "../pet/breeds";
import { createProfile, exportProfileFile, importProfileFile } from "../state/store";
import { h, button, toast, ICONS, svgIcon, section } from "../ui/ui";

export const renderProfiles = (root: HTMLElement, app: App) => {
  const refresh = () => {
    root.replaceChildren(build());
  };

  const onCreate = () => {
    const nameInput = h("input", { type: "text", placeholder: "宠物名字,如:豆豆", value: "" }) as HTMLInputElement;
    const breedSelect = h("select", {},
      ...Object.values(BREEDS).map((b) => h("option", { value: b.id }, b.name)),
    ) as HTMLSelectElement;
    const form = h("div", {},
      h("div", { className: "field" }, h("label", {}, "名字"), nameInput),
      h("div", { className: "field" }, h("label", {}, "品种(自动生成对应体型)"), breedSelect),
    );
    const confirmBtn = button("创建档案", "primary block", () => {
      const name = nameInput.value.trim() || BREEDS[breedSelect.value as BreedId].name;
      const p = createProfile(breedSelect.value as BreedId, name);
      app.profiles.push(p);
      app.persist();
      app.setProfile(p);
      toast(`已创建「${name}」`);
      refresh();
    });
    return h("div", {}, form, confirmBtn);
  };

  const build = (): HTMLElement => {
    const panel = h("div", { className: "panel" },
      h("h2", {}, "宠物档案"),
      h("p", { className: "sub" }, "管理门店客人的宠物档案,支持导入导出。选中档案后进入造型。"),
    );

    panel.append(section("新建档案", onCreate()));

    const list = h("div", { className: "pet-list" });
    if (app.profiles.length === 0) {
      list.append(h("div", { className: "empty" },
        svgIcon(ICONS.pet, 48),
        h("div", { className: "title" }, "还没有宠物档案"),
        h("div", { className: "desc" }, "在上方创建第一份档案"),
      ));
    }
    for (const p of app.profiles) {
      const item = h("div", { className: `pet-item${app.profile?.id === p.id ? " active" : ""}` },
        h("div", { className: "pet-avatar" }, svgIcon(ICONS.pet)),
        h("div", { className: "pet-info" },
          h("div", { className: "pet-name" }, p.name),
          h("div", { className: "pet-meta" }, `${BREEDS[p.breed].name} · ${p.strokes.length} 次调整`),
        ),
        h("div", { className: "pet-actions" }),
      );
      const actions = item.querySelector(".pet-actions")!;
      const exportBtn = h("button", { className: "icon-btn", title: "导出档案", type: "button" }, svgIcon(ICONS.export, 16));
      exportBtn.addEventListener("click", (e) => { e.stopPropagation(); exportProfileFile(p); });
      const delBtn = h("button", { className: "icon-btn danger", title: "删除", type: "button" }, svgIcon(ICONS.trash, 16));
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        app.profiles = app.profiles.filter((x) => x.id !== p.id);
        if (app.profile?.id === p.id) app.profile = app.profiles[0] ?? null;
        if (app.profile) app.setProfile(app.profile);
        app.persist();
        refresh();
      });
      actions.append(exportBtn, delBtn);
      item.addEventListener("click", () => {
        app.setProfile(p);
        toast(`当前宠物:${p.name}`);
        refresh();
      });
      list.append(item);
    }
    panel.append(section("档案列表", list));

    const importInput = h("input", { type: "file", accept: ".json", style: "display:none" }) as HTMLInputElement;
    importInput.addEventListener("change", async () => {
      const file = importInput.files?.[0];
      if (!file) return;
      try {
        const p = await importProfileFile(file);
        app.profiles.push(p);
        app.persist();
        app.setProfile(p);
        toast(`已导入「${p.name}」`);
        refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "导入失败");
      }
    });
    panel.append(h("div", { className: "btn-row" },
      button("导入档案", "", () => importInput.click()),
      button("导出当前档案", "", () => {
        if (app.profile) exportProfileFile(app.profile);
        else toast("请先选择档案");
      }),
    ), importInput);
    return panel;
  };

  root.append(build());
};
