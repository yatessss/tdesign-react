module.exports = {
  button: {
    configStr: `import configList from './props.json';\n`,
    importStr: `import { Button } from 'tdesign-react';\n`,
    usageStr: `const renderComp = <Button {...changedProps}>确定</Button>;`,
  },
  divider: {
    configStr: `import configList from './props.json';\n`,
    importStr: `import { Divider } from 'tdesign-react';\n`,
    usageStr: `
    const renderComp = (
      <div style={{ width: 200 }}>
        <span>正直</span>
        <Divider {...changedProps}>TDesign</Divider>
        <span>进取</span>
        <Divider {...changedProps}>TDesign</Divider>
        <span>合作</span>
        <Divider {...changedProps}>TDesign</Divider>
        <span>创新</span>
      </div>
    )`,
  },
  alert: {
    configStr: `import configList from './props.json';\n`,
    importStr: `import { Alert } from 'tdesign-react';\n`,
    usageStr: `
      const defaultProps = { message: '这是一条信息' };\n
      const renderComp = <Alert {...defaultProps} {...changedProps} />;
    `,
  },
  anchor: {
    configStr: `import configList from './props.json';\n`,
    importStr: `import { Anchor } from 'tdesign-react';\n`,
    usageStr: `
      const renderComp = (
        <Anchor {...changedProps}>
          <Anchor.AnchorItem href="#锚点一" title="基础锚点" />
          <Anchor.AnchorItem href="#锚点二" title="多级锚点" />
          <Anchor.AnchorItem href="#锚点三" title="指定容器锚点" />
        </Anchor>
      );
    `,
  },
  calendar: {
    configStr: `import configList from './props.json';\n`,
    importStr: `import { Calendar } from 'tdesign-react';\n`,
    usageStr: `const renderComp = <Calendar {...changedProps} />;`,
  },
  'date-picker': {
    configStr: `import configList from './props.json';\n`,
    importStr: `import { DatePicker } from 'tdesign-react';\n`,
    usageStr: `const renderComp = <DatePicker {...changedProps} />;`,
  },
  dropdown: {
    configStr: `import configList from './props.json';\n`,
    importStr: `import { Dropdown, Button } from 'tdesign-react';\n`,
    usageStr: `
      const defaultProps = { options: [{ content: '操作一', value: 1 }, { content: '操作二', value: 2 }]};
      const renderComp = (
        <Dropdown {...defaultProps} {...changedProps}>
          <Button>更多...</Button>
        </Dropdown>
      );`,
  },
};
