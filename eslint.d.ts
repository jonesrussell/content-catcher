declare module '@eslint/js' {
  const eslint: {
    configs: {
      recommended: any;
    };
  };
  export default eslint;
}

declare module 'eslint-plugin-import' {
  const plugin: any;
  export default plugin;
}

declare module 'eslint-plugin-react' {
  const plugin: any;
  export default plugin;
}

declare module 'eslint-plugin-react-hooks' {
  const plugin: any;
  export default plugin;
} 