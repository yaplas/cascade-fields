# cascade-fields

> dynamics forms base on what user is selecting/entering

[![NPM](https://img.shields.io/npm/v/cascade-fields.svg)](https://www.npmjs.com/package/cascade-fields) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save cascade-fields
```

## Usage

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
> also you can use CascadeFields to setup several fields

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

Cascade fields appear nested into the field that cause the cascade, the `by` metadata prop is used to give a name to the value of the parent field (`by` prop is ignored for fields that don't contain cascade), so here in the example, `report` field has its value in the prop `type`. If `by` was not set the prop name would be just `value`. This value is nested at the same level as the `report` cascade fields, in this example `report` has just one cascade field: `period`. If the user would have selected `detailed` instead of `summary` the field that would be appeared as `report` cascade would be `date`.
Options are set to specify the cascade of each possible field value, and if the component prop is not set also it is used by the default component (`OptionSelector`) to show a dropdown filled with the options. Options could be an array of items with `value` or an array of strings, or an object with props from where `OptionSelector` component gets the items to show in the dropdown. When a component is provided (set in the component prop in the metadata) it is up to that component what to do with the options, but they are still used to determinate the cascade fields. In the example we see in the `send` field that a checkbox component is set (input type checkbox) so it will ignore the options but those options are still used to determinate the cascade fields, that the reason why the `email` field appear just if the user checks the checkbox but it won't appear otherwise (`email` field is in the option with `true` value). In this case the option with value = `false` it is not necessary because input component ignored the options and that options does not contain cascade.

Some playable examples coming soon !!

## License

MIT © [Agustin Lascialandare](https://github.com/yaplas)
