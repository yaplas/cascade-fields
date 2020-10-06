import React from 'react'
import { CascadeFields } from 'cascade-fields'
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
      <CascadeFields metadata= {{
          report: {
            label: 'report',
            by: 'type',
            options: {
              summary: {
                cascade: {
                  period: { label: 'period', options: [ 'week', 'month', 'year' ] },
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
            label: 'check to send the report',
            by: 'shouldSend',
            options: [
              { value: true, cascade: { email: { label: 'email', component: 'input', type: 'email' } } },
              { value: false }
            ],
            component: 'input',
            type: 'checkbox'
          }
        }}
        />
        <button type='submit'>Submit</button>
      </Form>
    </Formik>)
}

export default App
