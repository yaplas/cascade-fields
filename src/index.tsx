import * as React from 'react'
import { toPairs, equals, identity } from 'ramda'
import { Field, useFormikContext, getIn } from 'formik'
import Select from 'react-select'
import styles from './styles.module.css'

export interface FieldsMeta {
  [key: string]: FieldDef
}

export interface FieldDef {
  label?: string | React.ReactNode
  by?: string
  options?: Options
  component?: string | React.ComponentType
  defaultComponent?: string | React.ComponentType
  validate?: (value: any) => undefined | string | Promise<any>
  cascade?: FieldsMeta
  props?: { [key: string]: any }
  [key: string]: any
}

export type Options =
  | { [key: string]: { value?: any; label?: string; cascade?: FieldsMeta } }
  | (string | { value: any; label?: string; cascade?: FieldsMeta })[]

export type OptionArrayItem = {
  value: any
  label: string
  cascade?: FieldsMeta
}

export type OptionArray = OptionArrayItem[]

export const CascadeFields = ({
  metadata,
  defaultComponent,
  name
}: {
  name?: string
  defaultComponent?: string | React.ComponentType
  metadata: FieldsMeta
}) => (
  <div className={`${styles.cascadeFields} cascade-fields`}>
    {toPairs(metadata).map(([fieldName, fieldDef]: [string, FieldDef]) => (
      <CascadeField
        key={fieldName}
        name={name ? `${name}.${fieldName}` : fieldName}
        defaultComponent={defaultComponent}
        {...fieldDef}
      />
    ))}
  </div>
)

export const CascadeField = ({
  name,
  label,
  by,
  options,
  component,
  defaultComponent,
  validate,
  cascade,
  props,
  ...rest
}: FieldDef & { name: string }) => {
  const formik = useFormikContext()
  const optionArr = optionArray(options || [])
  const anyCascade = optionArr.length
    ? optionArr.some((option) => 'cascade' in option)
    : false
  const fieldName = anyCascade ? `${name}.${by || 'value'}` : name
  const currentValue = getIn(formik.values, fieldName)
  const currentError = getIn(formik.errors, fieldName)
  const currentOption =
    anyCascade &&
    optionArr.find((option) =>
      // also we support option value as function for not discrete fields
      // if option value is a function default component (OptionSelector) will not work
      typeof option.value === 'function'
        ? option.value(currentValue)
        : equals(option.value, currentValue)
    )
  // to delete the field value if the component is unmounted (field is unregistered)
  React.useEffect(() => () => formik.setFieldValue(fieldName, undefined), [])
  return (
    <React.Fragment>
      <div
        className={[
          styles.cascadeField,
          currentError ? styles.error : undefined,
          'cascade-field'
        ]
          .filter(identity)
          .join(' ')}
      >
        {label ? (
          typeof label === 'string' ? (
            <label htmlFor={fieldName}>{label}</label>
          ) : (
            label
          )
        ) : undefined}
        {cascade === undefined && (
          <Field
            id={fieldName}
            name={fieldName}
            component={component || defaultComponent || OptionSelector}
            {...{ options: optionArr, ...(props || rest) }}
            // if the value is undefined first and then it is not,
            // react warning about the input component change from uncontrolled to controlled
            props={{
              value:
                currentValue === undefined || currentValue === null
                  ? ''
                  : currentValue
            }}
            validate={validate || validations.require}
          />
        )}
        {
          // when cascade prop is set directly in the field metadata (no into an option as usual)
          // means the field has no value, it is a group of fields
          cascade && (
            <CascadeFields
              name={name}
              defaultComponent={defaultComponent}
              metadata={cascade}
            />
          )
        }
      </div>
      {currentOption && currentOption.cascade && (
        <CascadeFields
          name={name}
          defaultComponent={defaultComponent}
          metadata={currentOption.cascade}
        />
      )}
    </React.Fragment>
  )
}

export const OptionSelector = ({
  options,
  field: { name, value },
  form: { setFieldValue }
}: {
  options: OptionArray
  name: string
  field: { name: string; value: any }
  form: { setFieldValue: Function }
}) => {
  const selectedOption = options.find((option) => equals(option.value, value))
  return (
    <Select
      options={options}
      onChange={({ value }: { value: any }) => setFieldValue(name, value)}
      value={selectedOption}
    />
  )
}

const optionArray = (options: Options): OptionArray =>
  options instanceof Array
    ? options.map((option) =>
        typeof option === 'string'
          ? { value: option, label: option }
          : {
              ...option,
              label: option.label ? option.label : `${option.value}`
            }
      )
    : toPairs(options).map(([key, option]) => ({
        ...option,
        value: 'value' in option ? option.value : key,
        label:
          'label' in option && typeof option.label === 'string'
            ? option.label
            : key
      }))

export const validations = {
  require: (value: any) =>
    value === undefined || value === null || value === ''
      ? 'required'
      : undefined
}
