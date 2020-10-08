import * as React from 'react'
import { toPairs, equals, identity } from 'ramda'
import { Field, useFormikContext, getIn } from 'formik'
import Select from 'react-select'
import styles from './styles.module.css'

export type FieldsMetadata = {
  [key: string]: FieldDef
}

export type FieldExtraProps = {
  [key: string]: any
}

export type FieldDef = {
  label?: string | React.ReactNode
  by?: string
  component?:
    | string
    | React.ComponentType
    | React.ComponentType<CascadeFieldsProps>
  cascade?: FieldsMetadata
  options?: Options
  defaultComponent?: React.ComponentType
  validate?: (value: any) => undefined | string | Promise<any>
  props?: FieldExtraProps
} & FieldExtraProps

export interface CascadeFieldProps extends FieldDef {
  name: string
}

export interface CascadeFieldsProps {
  name?: string
  defaultComponent?: React.ComponentType
  metadata: FieldsMetadata
}

export type Options =
  | {
      [key: string]: {
        value?: any
        label?: string
        component?: React.ComponentType<CascadeFieldsProps>
        cascade?: FieldsMetadata
      }
    }
  | (
      | string
      | {
          value: any
          label?: string
          component?: React.ComponentType<CascadeFieldsProps>
          cascade?: FieldsMetadata
        }
    )[]

export type OptionArrayItem = {
  value: any
  label: string
  component?: React.ComponentType<CascadeFieldsProps>
  cascade?: FieldsMetadata
}

export type OptionArray = OptionArrayItem[]

export const CascadeFields = ({
  metadata,
  defaultComponent,
  name
}: CascadeFieldsProps) => (
  <div className={styles.cascadeFields}>
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
}: CascadeFieldProps) => {
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
          currentError ? styles.error : undefined
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
        {cascade === undefined ? (
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
        ) : (
          // when cascade is defined directly into the field, this means the field is a fields group
          <RenderCascade
            name={name}
            defaultComponent={defaultComponent}
            metadata={cascade}
            component={component as React.ComponentType<CascadeFieldsProps>}
          />
        )}
      </div>
      {currentOption && currentOption.cascade && (
        // if the current selected option has cascade then render it
        <RenderCascade
          name={name}
          defaultComponent={defaultComponent}
          metadata={currentOption.cascade}
          component={currentOption.component}
        />
      )}
    </React.Fragment>
  )
}

const RenderCascade = ({
  name,
  defaultComponent,
  metadata,
  component
}: CascadeFieldsProps & {
  component?: React.ComponentType<CascadeFieldsProps>
}) => {
  const Component = component || CascadeFields
  return (
    <Component
      name={name}
      defaultComponent={defaultComponent}
      metadata={metadata}
    />
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
