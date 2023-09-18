import { useCallback, useRef, useState } from "preact/hooks";
import slugify from "slug";
import { debounce } from "lodash";

export default function UploadForm() {
  const [name, setName] = useState("");
  const [slug, primitiveSetSlug] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("");
  const [useCustomSlug, setUseCustomSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | undefined>(
    undefined
  );
  const [file, setFile] = useState<File | undefined>(undefined);

  const checkSlugAvailable = useCallback(
    debounce((slug: string) => {
      if (slug) {
        fetch(`http://localhost:8080/v1/packs/${slug}`).then((res) => {
          if (res.status === 200) {
            setSlugAvailable(false);
          } else if (res.status === 404) {
            setSlugAvailable(true);
          } else {
            setSlugAvailable(undefined);
          }
        });
      } else {
        setSlugAvailable(undefined);
      }
    }, 500),
    [setSlugAvailable]
  );

  const setSlug = useCallback(
    (slug: string) => {
      primitiveSetSlug(slug);
      checkSlugAvailable(slug);
    },
    [primitiveSetSlug]
  );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.set("name", name);
        data.set("description", description);
        data.set("version", version || "1.0.0");
        data.set("tags", "");
        data.set("file", file!);

        const response = await fetch(`http://localhost:8080/v1/packs/${slug}`, {
          method: "post",
          body: data,
        });
        if (response.ok) {
          console.log("upload accepted, processing beginning");
          window.location.assign(`/packs/${slug}`);
        }
      }}
    >
      <div class="mb-4">
        <div class="mb-2">
          <label for="name">Name</label>
        </div>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={name}
          onInput={(e) => {
            const name = e.currentTarget.value;
            if (!useCustomSlug) {
              setSlug(slugify(name));
            }
            setName(name);
          }}
          class="py-1 px-2 border-2 dark:bg-sky-900 dark:border-sky-100/50"
        />
      </div>
      <div class="mb-4">
        <div class="mb-2">
          <label for="version">Version</label>
        </div>
        <input
          type="text"
          name="version"
          id="version"
          value={version}
          pattern="\d+\.\d+\.\d+"
          placeholder="1.0.0"
          onInput={(e) => {
            const version = e.currentTarget.value.trim();
            setVersion(version);
            (e.target as any).value = version;
          }}
          class="py-1 px-2 border-2 dark:bg-sky-900 dark:border-sky-100/50"
        />
      </div>
      <div class="mb-4">
        <div class="mb-2">
          <label for="slug">Slug</label>
        </div>
        <div>
          <input
            class="ml-2"
            type="radio"
            name="use-custom"
            id="auto-gen"
            checked={!useCustomSlug}
            onInput={() => setUseCustomSlug((v) => !v)}
          />
          <label for="auto-gen" class="ml-2">
            Automatically generate from name
          </label>
        </div>
        <div>
          <input
            class="ml-2"
            type="radio"
            name="use-custom"
            id="use-custom"
            checked={useCustomSlug}
            onInput={() => setUseCustomSlug((v) => !v)}
          />
          <label for="use-custom" class="ml-2 mr-1">
            Custom:{" "}
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            required
            disabled={!useCustomSlug}
            value={slug}
            onInput={(e) => setSlug(e.currentTarget.value)}
            class="py-1 px-2 border-2 dark:bg-sky-900 dark:border-sky-100/50 disabled:text-sky-800/50 dark:disabled:text-sky-100/50 dark:disabled:bg-sky-100/10"
          />
          {slugAvailable === true ? (
            <span class="ml-2 text-green-500 dark:text-green-300">
              slug available!
            </span>
          ) : slugAvailable === false ? (
            <span class="ml-2 text-red-500 dark:text-red-300">slug taken</span>
          ) : (
            <span></span>
          )}
        </div>
      </div>
      <div class="mb-4">
        <div class="mb-2">
          <label for="description">
            Description{" "}
            <span class="dark:text-sky-100/50">(optional, markdown)</span>
          </label>
        </div>
        <textarea
          id="description"
          class="w-full py-1 px-2 border-2 dark:bg-sky-900 dark:border-sky-100/50 font-mono"
          value={description}
          onInput={(e) => setDescription(e.currentTarget.value)}
        ></textarea>
      </div>
      <div class="mb-4">
        <div class="mb-2">
          <label for="filepicker">ZIP package</label>
        </div>
        <input
          required
          type="file"
          accept=".zip"
          name="file"
          id="filepicker"
          class="p-2 border-2 dark:bg-sky-900 dark:border-sky-100/50"
          onInput={(e) => {
            setFile(e.currentTarget.files?.[0]);
          }}
        />
      </div>
      <div>
        <button
          id="submit"
          class="mt-2 p-2 inline-flex gap-2 border-2 border-sky-800/10 hover:border-sky-800 dark:border-sky-100/50 dark:hover:border-sky-100"
        >
          Upload
        </button>
      </div>
    </form>
  );
}
