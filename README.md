# cascade-fields

> dynamics forms base on what user is selecting/entering

[![NPM](https://img.shields.io/npm/v/cascade-fields.svg)](https://www.npmjs.com/package/cascade-fields) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save cascade-fields
```

## Usage

Use `<CascadeField>` component to setup a field with cascade fields depending which value is entered by the user.

```tsx
import React from 'react'
import { CascadeField } from 'cascade-fields'
import { Formik, Form } from 'formik'
import 'cascade-fields/dist/index.css'

const App = () => {
  return (
    <Formik
      initialValues={{}}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        });
      }}
    >
      <Form>
        <CascadeField
          name='report'
          by='type'
          options={{
            summary: {
              cascade: {
                // here period field just appear if the summary option is selected
                period: { label: 'period', options: ['week', 'month', 'year'] },
              },
            },
            detailed: {
              cascade: {
                // here date field just appear if the detailed option is selected
                date: { label: 'date', component: 'input', type: 'date' },
              }
            }
          }}
        />
        <button type='submit'>Submit</button>
      </Form>
    </Formik>)
}
```

also you can use `<CascadeFields />` component to setup several fields

```tsx
        <CascadeFields metadata= {{
          report: {
            label: 'report',
            by: 'type'
            options: {
              summary: {
                cascade: {
                  period: { label: 'period', options: ['week', 'month', 'year'] },
                },
              },
              detailed: {
                cascade: {
                  date: { label: 'date', component: 'input', type: 'date' },
                  comment: { label: 'comment', component: 'input', maxLength: 50 },
                }
              }
            }
          },
          send: {
            label: 'Do you want to send the report?'
            by: 'shouldSend',
            options: [
              {value: true, cascade: {email: {label: 'email', component: 'input', type: 'email'}}},
              // this option could be removed given it doesn't contain cascade
              // and the component is just a checkbox so it doesn't need the options
              {value: false}
            ]
            component: 'input',
            type: 'check'
          }
        }}
        />
```

Base on data the user enter, submitting the form, will create an object like this:

```js
{
  report: {
    type: 'summary',
    period: 'week'
  },
  send: {
    shouldSend: true,
    email: 'jdoe@here.com'
  }
}
```

## Notes

When a field has a cascade, the cascade fields appear nested into the field name, and the parent field actual value will be in a `value` prop at the same level of the fields in cascade. This behavior is desirable to avoid names collision between fields in cascades of different parents. If the metadata contains the `by` attribute the `value` prop will be renamed. In this example `report` field has two options, one with a cascade of just one field (`period`) and two fields in the second option (`date` and `comment`). Base on what the user select (`summary` or `detailed`) the respective cascade fields will appear in the UI. The value of the field `report` itself appear into the prop `type` because of the `by` metadata attribute. 
Options are set to specify the cascade of each possible field value, and if the `component` prop is not set also it is used by the default component (`OptionSelector`) to show a dropdown filled with the options. Options could be an array of items with `value` or an array of strings, or an object with props from where `OptionSelector` component gets the items to show in the dropdown. When a component is provided (set in the component prop in the metadata) it is up to that component what to do with the options, but they are still used to determinate the cascade fields. In the example we see in the `send` field that a checkbox component is set (input type checkbox) so it will ignore the options but those options are still used to determinate the cascade fields, that the reason why the `email` field appear just if the user checks the checkbox but it won't appear otherwise (`email` field is in the option with `true` value). In this case the option with value as `false` is not necessary because input component ignored the options and that option does not contain cascade.

Some playable examples coming soon !!

## License

MIT © [Agustin Lascialandare](https://github.com/yaplas)
