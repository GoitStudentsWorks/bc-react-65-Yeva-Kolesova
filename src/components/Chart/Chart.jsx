import { Chart as ChartJS, registerables } from 'chart.js';
import { formatNumber } from 'components/StatisticsTable/StatisticsTable';
import { Doughnut } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { selectSummary } from 'reduxConfig/statistics/selectors';

ChartJS.register(...registerables);

export const coloredCategoriesMap = new Map([
  ['Main expenses', 'rgba(254, 208, 87, 1)'],
  ['Products', 'rgba(255, 216, 208, 1)'],
  ['Car', 'rgba(253, 148, 152, 1)'],
  ['Self care', 'rgba(197, 186, 255, 1)'],
  ['Child care', 'rgba(110, 120, 232, 1)'],
  ['Household products', 'rgba(74, 86, 226, 1)'],
  ['Education', 'rgba(129, 225, 255, 1)'],
  ['Leisure', 'rgba(36, 204, 167, 1)'],
  ['Other expenses', 'rgba(0, 173, 132, 1)'],
  ['Entertainment', 'rgb(255, 137, 212)'],
]);

export function Chart() {
  const summary = useSelector(selectSummary);

  const periodSummary = summary.categoriesSummary
    ? summary.categoriesSummary
        .filter(category => category.type === 'EXPENSE')
        .map(category => ({
          ...category,
          color: coloredCategoriesMap.get(category.name),
        }))
        .sort((a, b) => a.total - b.total)
    : [];

  const data = {
    datasets: [
      {
        data: periodSummary.length
          ? periodSummary.map(expense => expense.total)
          : [1],
        backgroundColor: periodSummary.length
          ? periodSummary.map(expense => expense.color)
          : '#45454568',
        boxShadow: '0px 0px 8px 0px #000 inset',
      },
    ],
  };

  const options = {
    cutout: '70%',
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    width: 288,
    height: 288,
  };

  return (
    <div
      style={{
        width: '288px',
        height: '288px',
        position: 'relative',
      }}
    >
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'Poppins',
            color: 'var(--white)',
          }}
        >
          ₴ {formatNumber(summary.expenseSummary)}
        </span>
      </div>
    </div>
  );
}
