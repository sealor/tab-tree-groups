import { expect } from 'chai'
import { ref, reactive, watch, watchEffect } from 'vue'

export function describeLearningVueTests() {
  describe("Learning Vue3", function () {
    describe("Simple ref string with watch", function () {
      it("Change string", () => {
        return new Promise((resolve, reject) => {
          const str = ref("");
          watch(str, (newStr, oldStr) => {
            try {
              expect(newStr).to.equals("text");
              expect(oldStr).to.equals("");
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          str.value = "text";
        });
      });
    });
    describe("Simple reactive array with watch", function () {
      it("Push item", () => {
        return new Promise((resolve, reject) => {
          const array = reactive([]);
          watch(array, (array) => {
            try {
              expect(array[0]).to.equals("item");
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          array.push("item");
        });
      });
    });
    describe("Special reactive array with watch", function () {
      class MyArray extends Array {
      }

      it("Push item", () => {
        return new Promise((resolve, reject) => {
          const array = reactive(new MyArray());
          watch(array, (array) => {
            try {
              expect(array[0]).to.equals("item");
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          array.push("item");
        });
      });
    });
    describe("Simple reactive array with element with watch", function () {
      it("Push item and change property", () => {
        return new Promise((resolve, reject) => {
          const array = reactive([]);
          array.push({prop: true});
          watch(array, (array) => {
            try {
              expect(array[0].prop).to.equals(false);
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          array[0].prop = false;
        });
      });
    });
    describe("Simple reactive tree with watch", function () {
      it("Push items and change property", () => {
        return new Promise((resolve, reject) => {
          const roots = reactive([]);
          const subRoot = []
          roots.push(subRoot);
          subRoot.push({prop: true});
          watch(roots[0][0], (elem) => {
            try {
              expect(false).to.equals(elem.prop);
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          roots[0][0].prop = false;
        });
      });
      it("Push items and change property (2)", () => {
        return new Promise((resolve, reject) => {
          const roots = reactive([]);
          const element = {items: []}
          roots.push(element);
          element.items.push({prop: true});
          watch(roots[0], (elem) => {
            try {
              expect(false).to.equals(elem.items[0].prop);
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          roots[0].items[0].prop = false;
        });
      });
    });
  });
}
