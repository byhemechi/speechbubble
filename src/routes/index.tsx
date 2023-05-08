import { Show, createSignal, onMount } from "solid-js";
import { A } from "solid-start";
import Counter from "~/components/Counter";

const readerPromise = (file: File) =>
  new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => resolve(reader.result);
    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });

const imagePromise = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = src;
  });

export default function Home() {
  const [error, setError] = createSignal<string | null>(null);
  let c: HTMLCanvasElement | undefined = undefined;

  async function render(image: File) {
    if (!c) return setError("Couldn't attach to canvas");
    const ctx = c.getContext("2d");
    if (!ctx) return setError("Couldn't get context");

    const file = await readerPromise(image);
    console.log(file);
    if (!file) throw new Error("Couldn't read image");

    const img = await imagePromise(file.toString());

    c.width = img.width;
    c.height = img.height;

    // bubble
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, c.height);
    ctx.lineTo(c.width, c.height);
    ctx.lineTo(c.width, 0);
    ctx.quadraticCurveTo(
      c.width * 0.7,
      c.width * 0.1,
      c.width * 0.45,
      c.width * 0.1
    );
    ctx.lineTo(c.width * 0.4, c.width * 0.2);
    ctx.lineTo(c.width * 0.3, c.width * 0.1);

    ctx.clip();

    ctx.drawImage(img, 0, 0);
  }

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1>Speech Bubble Generator</h1>
      <Show when={error()}>
        <div class="text-red-600">{error()}</div>
      </Show>
      <input
        type="file"
        oninput={(ev) => {
          const [file] = ev.currentTarget.files ?? [];

          if (!file) return setError("Missing File");
          if (!file.type.startsWith("image/"))
            return setError("File is not an image");

          render(file);
        }}
      />
      <canvas
        ref={c}
        class="h-96 mx-auto rounded-xl shadow-lg bg-white"
      ></canvas>
    </main>
  );
}
