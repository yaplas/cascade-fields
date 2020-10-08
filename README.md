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

## UI

Cascade fields appear in the UI base on what user enter in the parent field, the parent field has an `options` prop where its possible values are defined with the respective cascade of fields. The cascade of each option could be different and also there could be options with no any cascade, cascade prop is not mandatory within an option. Each field could be rendered using the default component which is the `OptionSelector` that is a dropdown filled with the options items defined. Also users can provide their own component to render the field, in that case is up to that component what to do with the options, but the options are still used to determine the cascade fields.
Cascade fields can be defined also directly into a field (no within an option as usual), this means that the field is, in fact, a group of fields (an object), so it does not have any value.
There is no limit in the depth of cascades definition, users can define cascade into an option of a field that comes from the cascade of another option of another parent field that comes from... and so on...

## Extensibility

As we said previously, users can provide their own components to render each field using the `component` prop into the field definition, also they can provide a default component passed by the `defaultComponent` prop of `CascadeFields`, that will be used instead of `OptionSelector` for all the fields with no component set. For instance let's say that you have some option items that should be available only for the admin users, so you can implement your own dropdown (maybe wrapping the `OptionSelector` which is exported by this library) to filter option items base on the user privileges.
We already said that cascade fields could be defined directly into a field, making this field to be a group of fields, well, users can also set their own components to render this "fields group" if this component is not set (the usual case) the library will use `CascadeFields`. This is valid also into an option, so users can define their own component to render any cascade. Do not be confused with this `component` prop into the option, it has nothing to do with the option it self, it is just to render the cascade of that option, in fact, if the option does not have any cascade the `component` prop will be ignored.

## Result (submitted object)

When a field has cascade, the cascade fields appear nested into the field name, and the parent field actual value will be in a `value` prop at the same level of the fields in cascade. This behavior is desirable to avoid name collisions between fields in cascades of different parents. If the metadata contains the `by` attribute the `value` prop will be renamed to the value of `by`.


## Playground

https://codesandbox.io/s/cascade-fields-example-dhkri


## License

MIT © [Agustin Lascialandare](https://github.com/yaplas)
