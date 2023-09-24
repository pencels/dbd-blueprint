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

  const [uploadProgress, setUploadProgress] = useState<number | undefined>(undefined);

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

        const xhr = new XMLHttpRequest();
        await new Promise((resolve, reject) => {
          xhr.withCredentials = true;
          xhr.upload.addEventListener('progress', event => {
            setUploadProgress(event.loaded * 100 / event.total);
          });
          xhr.addEventListener('loadend', () => {
            setUploadProgress(100);
            resolve(undefined);
          })
          xhr.addEventListener('error', e => {
            reject(e);
          })

          xhr.open("POST", `http://localhost:8080/v1/packs/${slug}`, true);
          xhr.send(data);
        });

        if (xhr.status === 202) {
          console.log("upload accepted, processing beginning");
          window.location.assign(`/assets/${slug}`);
        }
      }}
    >
      <div class="mb-6">
        <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
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
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div class="mb-6">
        <label for="version" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Version</label>
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
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div class="mb-6">
        <label for="slug" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Slug</label>
        <div class="flex items-center mb-4">
          <input
            class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
            type="radio"
            name="use-custom"
            id="auto-gen"
            checked={!useCustomSlug}
            onInput={() => setUseCustomSlug((v) => !v)}
          />
          <label for="auto-gen" class="block ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Automatically generate from name
          </label>
        </div>
        <div class="flex items-center mb-4">
          <input
            class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
            type="radio"
            name="use-custom"
            id="use-custom"
            checked={useCustomSlug}
            onInput={() => setUseCustomSlug((v) => !v)}
          />
          <label for="use-custom" class="block mx-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Custom:
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            required
            disabled={!useCustomSlug}
            value={slug}
            onInput={(e) => setSlug(e.currentTarget.value)}
            class="font-mono bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
      <div class="mb-6">
        <label for="description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Description
          <span class="dark:text-sky-100/50 ml-2">(optional, markdown)</span>
        </label>
        <textarea
          id="description"
          class="font-mono block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={description}
          onInput={(e) => setDescription(e.currentTarget.value)}
        ></textarea>
      </div>
      <div class="mb-6">
        <label for="filepicker" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          ZIP package
        </label>
        <input
          required
          type="file"
          accept=".zip"
          name="file"
          id="filepicker"
          class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:!bg-gray-500 file:hover:!bg-gray-600"
          onInput={(e) => {
            setFile(e.currentTarget.files?.[0]);
          }}
        />
      </div>
      <div>
        <button id="submit" type="submit" class="inline-flex items-center text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          <svg class="w-3.5 h-3.5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="m14.707 4.793-4-4a1 1 0 0 0-1.416 0l-4 4a1 1 0 1 0 1.416 1.414L9 3.914V12.5a1 1 0 0 0 2 0V3.914l2.293 2.293a1 1 0 0 0 1.414-1.414Z"/>
              <path d="M18 12h-5v.5a3 3 0 0 1-6 0V12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
          </svg>
          Upload
        </button>
      </div>
      {
        uploadProgress !== undefined && (
          <div class="mt-3 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div class="transition-all bg-blue-600 h-2.5 rounded-full" style={{ width: uploadProgress + '%' }}></div>
          </div>
        )
      }
    </form>
  );
}
