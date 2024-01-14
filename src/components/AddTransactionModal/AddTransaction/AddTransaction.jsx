import { selectFilteredCategories } from 'reduxConfig/transactions/selectors';
import {
  CloseBtn,
  CommentInputStyled,
  ErrorMessage,
  Expense,
  Income,
  InputErrorWrap,
} from './AddTransaction.styled';
import {
  Backdrop,
  BtnAdd,
  BtnCancel,
  ButtonsWrap,
  CloseModalBtn,
  Gradient,
  Form,
  Input,
  Modal,
  Title,
  TransactionToggleWrap,
  WrapSumCalendar,
} from './AddTransaction.styled';
import 'react-datepicker/dist/react-datepicker.css';
import React, { useEffect, useState } from 'react';
import { InputToggle, LabelToggle, SpanToggle } from './AddTransaction.styled';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTransactionThunk,
  getTransactionsCategoriesThunk,
} from '../../../reduxConfig/transactions/operations';
import Select, { components } from 'react-select';
import { SlArrowDown, SlArrowUp } from 'react-icons/sl';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useMediaQuery } from 'react-responsive';
import Header from '../../Header/Header';
import {
  CalendarContainer,
  CalendarIcon,
  DateWrapper,
} from './Calendar.styled';
import ReactDatePicker from 'react-datepicker';
import { date } from 'yup';

export const INCOME_CODE = '063f1132-ba5d-42b4-951d-44011ca46262';

const schema = yup
  .object({
    amount: yup
      .number()
      .typeError('Please, enter the sum')
      .min(1, 'Sum value must be at least 1 character')
      .required('Sum is required'),
    date: date().required('Date is required'),
    category:yup.string().uuid('Incorrect format').required('Category is required'),
  })
  .required();

export const AddTransaction = ({ closeModal }) => {
  const [isMinus, setIsMinus] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const dispatch = useDispatch();
  const transactionCategories = useSelector(selectFilteredCategories);
  const isTabletOrDesktop = useMediaQuery({ query: '(min-width: 768px)' });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    dispatch(getTransactionsCategoriesThunk());
  }, [dispatch]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const onBackdropClick = e => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeModal]);

  const onCancelButton = () => {
    closeModal();
  };

  const transformDate = function getFormattedDate() {
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const transformedDate = `${year}-${month}-${day}`;
    return transformedDate;
  };

  function onSubmit(formData) {
    const transaction = {};
    transaction.comment = formData.comment;
    const amountValue = Number(formData.amount).toFixed(2);
    transaction.amount =
      formData.isExpense && amountValue > 0 ? -amountValue : amountValue;
    transaction.type = formData.isExpense ? 'EXPENSE' : 'INCOME';
    transaction.categoryId = formData.isExpense
      ? formData.category
      : INCOME_CODE;
    transaction.transactionDate = transformDate(startDate);
    dispatch(addTransactionThunk(transaction))
      .unwrap()
      .then(() => {
        toast.success('Transaction successfully added');
      })
      .catch(err => {
        console.log(err);
        toast.error('Something went wrong, try again');
      });
    closeModal();
  }

  const selectStyle = {
    control: styles => ({
      ...styles,
      backgroundColor: 'transparent',
      marginBottom: '-2px',
      marginTop: '40px',
      border: 'none',
      borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
      outline: 'none',
      borderRadius: '0',
      boxShadow: 'none',
      cursor: 'pointer',

      '&:hover': {
        border: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
      },
    }),
    singleValue: styles => ({
      ...styles,
      color: '#FBFBFB',
      fontSize: '18px',
    }),
    placeholder: styles => ({
      ...styles,
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '18px',
    }),
    menu: styles => ({
      ...styles,
      borderRadius: '8px',
      backgroundColor: 'transparent',
      boxShadow: '0px 4px 60px 0px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(50px)',
      overflow: 'hidden',
      color: '#FBFBFB',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '16px',
      fontWeight: '400',

      '&::before': {
        background:
          'linear-gradient(0deg, rgba(83, 61, 186, 0.70) 0%, rgba(80, 48, 154, 0.70) 43.14%, rgba(106, 70, 165, 0.52) 73.27%, rgba(133, 93, 175, 0.13) 120.03%)',
        content: '""',
        filter: 'blur(50px)',
        position: 'absolute',
        inset: '0%',
        zIndex: '-1',
      },
    }),
    option: (styles, { isFocused, isSelected }) => {
      if (isFocused) {
        return {
          ...styles,
          background: '#FFFFFF1A',
          color: '#FF868D',
        };
      } else if (isSelected) {
        return {
          ...styles,
          background: 'transparent',
        };
      } else {
        return {
          ...styles,
        };
      }
    },
  };

  const DropdownIndicator = props => {
    return (
      <components.DropdownIndicator {...props}>
        {props.selectProps.menuIsOpen ? (
          <SlArrowUp size={18} label="Arrow up" color={'var(--white)'} />
        ) : (
          <SlArrowDown size={18} label="Arrow down" color={'var(--white)'} />
        )}
      </components.DropdownIndicator>
    );
  };

  function handleDateChange(dateChange) {
    setValue("date", dateChange, {
      shouldDirty: true
    });
    setStartDate(dateChange);
  }

  return (
    <Backdrop onClick={onBackdropClick}>
      {!isTabletOrDesktop && <Header />}
      <Modal>
        <Gradient />
        <CloseModalBtn type="button" onClick={() => closeModal()}>
          <CloseBtn />
        </CloseModalBtn>
        <Title>Add transaction</Title>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <TransactionToggleWrap>
            <Income $active={!isMinus}>Income</Income>
            <LabelToggle>
              <InputToggle
                type="checkbox"
                defaultChecked={true}
                {...register('isExpense')}
                onChange={() => setIsMinus(!isMinus)}
              />
              <SpanToggle />
            </LabelToggle>
            <Expense $active={isMinus}>Expense</Expense>
          </TransactionToggleWrap>

          {isMinus && (
            <Controller
              name="category"
              control={control}
              rules={{ required: true }}
              render={({ field, value }) => (
                <Select
                  id="category"
                  options={transactionCategories}
                  components={{
                    DropdownIndicator,
                    IndicatorSeparator: () => null,
                  }}
                  placeholder="Select a category"
                  styles={selectStyle}
                  isSearchable={false}
                  value={transactionCategories.find(
                    category => category.value === value
                  )}
                  onChange={option => field.onChange(option.value)}
                />
              )}
            />
          )}

          <WrapSumCalendar>
            <InputErrorWrap>
              <Input
                type="text"
                name="amount"
                placeholder="0.00"
                {...register('amount')}
                autoComplete="off"
              />
              {errors.amount && (
                <ErrorMessage>{errors.amount.message}</ErrorMessage>
              )}
            </InputErrorWrap>
            <DateWrapper>
              <Controller
                name="date"
                control={control}
                defaultValue={startDate}
                render={() => (
                  <ReactDatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    dateFormat="dd.MM.yyyy"
                    maxDate={new Date()}
                    calendarContainer={CalendarContainer}
                  />
                )}
              />
              <CalendarIcon />
            </DateWrapper>
          </WrapSumCalendar>

          <CommentInputStyled
            type="text"
            placeholder="Comment"
            autoComplete="off"
            {...register('comment')}
          />
          <ButtonsWrap>
            <BtnAdd type="submit">Add</BtnAdd>
            <BtnCancel type="button" onClick={onCancelButton}>
              Cancel
            </BtnCancel>
          </ButtonsWrap>
        </Form>
      </Modal>
    </Backdrop>
  );
};
