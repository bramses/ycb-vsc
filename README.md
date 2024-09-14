# ycb-vsc

video: https://www.youtube.com/watch?v=GMFN-XxNOSE

highlight code:
 takes highlighted code and converts it to a markdown code block with the language specified and summary of the code block then sends it to the ycb api

summarize code:
    summarizes entire file and sends summary to ycb api

for cursor dev: 

change
```
"engines": {
    "vscode": "^1.91.1"
  },
```

to 

```
"engines": {
    "vscode": "^0.37.1"
  },
```

Compile Your Extension:
Ensure your TypeScript code is compiled.
compile
Package the Extension:
Use vsce to package your extension into a .vsix file.
   vsce package
This will create a .vsix file in your project directory.
Install the Extension Locally:
You can install the .vsix file in your local VS Code instance.
Open VS Code.
