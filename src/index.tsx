import * as React from 'react'
import { toPairs, equals, identity } from 'ramda'
import { Field, useFormikContext, getIn } from 'formik'
import Select from 'react-select'
import styles from './styles.module.css'

// metadata is just a bunch of field definitions
// name of the prop (key) is the name of the field
export type FieldsMetadata = {
  [key: string]: FieldDef
}

// extra props are passed down to the field component
export type FieldExtraProps = {
  [key: string]: any
}

export type FieldDef = {
  // if label is set it will be rendered right before the field component
  label?: string | React.ReactNode
  // by is used to rename 'value' prop of parent fields (fields that have options with cascade)
  by?: string
  // component to render the field, it will be passed to the formik <Field /> component
  // in case cascade prop is defined directly into the field definition, the component provided
  // will be used to render the cascade (a cascade contains basically a bunch of field definitions)
  component?:
    | string
    | React.ComponentType
    | React.ComponentType<CascadeFieldsProps>
  // if cascade is defined the field is not actually a field but a group of fields (an object)
  // cascade prop contains a bunch of field definitions
  cascade?: FieldsMetadata
  // options prop contains define the different values the field could be valued, and the cascade
  // associated with that value
  options?: Options
  // default component is used when a definition of a field does not have a component prop set
  // if this prop is not set the <OptionSelector /> component will be use
  defaultComponent?: React.ComponentType
  // validate function is the field validation, by default all the field has the 'required' validation
  // which is exported by this library as validations.required
  validate?: (value: any) => undefined | string | Promise<any>
  // extra props will be passed to the field component,
  // this props could be set directly into the field definition
  // but in case there is a name collision with one of FieldDef prop,
  // it is possible to use this `props` object to passe them through
  props?: FieldExtraProps
} & FieldExtraProps

export interface CascadeFieldProps extends FieldDef {
  name: string
}

export interface CascadeFieldsProps {
  // name prop is used to make all the field will be inserted under this object name
  // name prop support dot notation (level1.level2.level3 ...) to insert the fields into any depth
  name?: string
  // default component is used instead of <OptionSelector /> to render fields that has not 'component' prop set
  defaultComponent?: React.ComponentType
  // metadata is a bunch of field definitions
  metadata: FieldsMetadata
}

// options are used to define the cascade of field triggered by each possible parent field value,
// also they are used by the default <OptionSelector /> field component to fill the rendered dropdown
export type Options =
  // options could be an object where each prop is an option item
  // it is possible to se the value and the label of the option
  // but both are not mandatory, if value is not provided the prop name will be used
  // if label is not provided, the value or the prop name will be used
  | {
      [key: string]: {
        value?: any
        label?: string
        component?: React.ComponentType<CascadeFieldsProps>
        cascade?: FieldsMetadata
      }
    }
  // options could also be an array of strings or objects,
  // if the item is an string that value will be used as value and label,
  // if the item is an object then value is mandatory, but not label
  | (
      | string
      | {
          value: any
          label?: string
          component?: React.ComponentType<CascadeFieldsProps>
          cascade?: FieldsMetadata
        }
    )[]

// option array item is the way the component set into the field receive the option items
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
