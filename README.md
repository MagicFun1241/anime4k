# Anime4K
Image upscale library

## Examples
```typescript
import * as path from "path";

import anime4k from "@magicfun1241/anime4k";

const cwd = process.cwd();
anime4k(path.join(cwd, "input.jpg")).gpuAcceleration(true).toFile(path.join(cwd, "output.jpg")).then(() => {
    console.log("Done!");
});
```

## License
MIT