import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalDataPoint, TechnicalPattern } from '@/lib/types';

interface StockChartProps {
  data: HistoricalDataPoint[];
  height?: number;
  highlightedPattern?: TechnicalPattern | null;
}

export function StockChart({ data, height = 300, highlightedPattern = null }: StockChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [height]);

  useEffect(() => {
    if (!svgRef.current || !data.length || dimensions.width === 0) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.date)) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.price)! * 0.98,
        d3.max(data, (d) => d.price)! * 1.02,
      ])
      .range([chartHeight, 0]);

    const line = d3
      .line<HistoricalDataPoint>()
      .x((d) => x(new Date(d.date)))
      .y((d) => y(d.price))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const area = d3
      .area<HistoricalDataPoint>()
      .x((d) => x(new Date(d.date)))
      .y0(chartHeight)
      .y1((d) => y(d.price))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'oklch(0.45 0.15 250)')
      .attr('stop-opacity', 0.3);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'oklch(0.45 0.15 250)')
      .attr('stop-opacity', 0);

    g.append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'oklch(0.45 0.15 250)')
      .attr('stroke-width', 2)
      .attr('d', line);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((d) => d3.timeFormat('%b %d')(d as Date))
      )
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.50 0.02 250)');

    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `$${d}`)
      )
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.50 0.02 250)');

    g.selectAll('.domain, .tick line')
      .style('stroke', 'oklch(0.88 0.01 250)');

    const tooltip = d3
      .select(containerRef.current)
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid oklch(0.88 0.01 250)')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)');

    const focus = g.append('g').style('display', 'none');

    focus
      .append('circle')
      .attr('r', 4)
      .attr('fill', 'oklch(0.45 0.15 250)');

    focus
      .append('line')
      .attr('class', 'x-hover-line')
      .attr('stroke', 'oklch(0.88 0.01 250)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    svg
      .append('rect')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('width', width)
      .attr('height', chartHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        focus.style('display', 'none');
        tooltip.style('visibility', 'hidden');
      })
      .on('mousemove', function (event) {
        const [xPos] = d3.pointer(event);
        const x0 = x.invert(xPos);
        const bisect = d3.bisector((d: HistoricalDataPoint) => new Date(d.date)).left;
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = x0.getTime() - new Date(d0?.date || 0).getTime() > new Date(d1?.date || 0).getTime() - x0.getTime() ? d1 : d0;

        if (d) {
          focus.attr('transform', `translate(${x(new Date(d.date))},${y(d.price)})`);
          focus.select('.x-hover-line')
            .attr('y1', 0)
            .attr('y2', chartHeight - y(d.price));

          tooltip
            .style('visibility', 'visible')
            .html(
              `<strong>${d3.timeFormat('%b %d, %Y')(new Date(d.date))}</strong><br/>$${d.price.toFixed(2)}<br/>Vol: ${d.volume.toLocaleString()}`
            )
            .style('left', `${event.pageX - containerRef.current!.getBoundingClientRect().left + 10}px`)
            .style('top', `${event.pageY - containerRef.current!.getBoundingClientRect().top - 40}px`);
        }
      });

    return () => {
      tooltip.remove();
    };
  }, [data, dimensions]);

  useEffect(() => {
    if (!svgRef.current || !highlightedPattern || !data.length || dimensions.width === 0) {
      d3.select(svgRef.current).selectAll('.pattern-overlay').remove();
      return;
    }

    const margin = { top: 20, right: 20, bottom: 30, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('.pattern-overlay').remove();

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.date)) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.price)! * 0.98,
        d3.max(data, (d) => d.price)! * 1.02,
      ])
      .range([chartHeight, 0]);

    const overlayGroup = svg
      .append('g')
      .attr('class', 'pattern-overlay')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const overlayData = highlightedPattern.overlayData;
    if (!overlayData) return;

    if (overlayData.zones) {
      overlayData.zones.forEach(zone => {
        const zoneStartDate = data[zone.x]?.date;
        const zoneEndDate = data[Math.min(zone.x + zone.width, data.length - 1)]?.date;
        
        if (zoneStartDate && zoneEndDate) {
          overlayGroup
            .append('rect')
            .attr('x', x(new Date(zoneStartDate)))
            .attr('y', y(zone.y + zone.height))
            .attr('width', x(new Date(zoneEndDate)) - x(new Date(zoneStartDate)))
            .attr('height', y(zone.y) - y(zone.y + zone.height))
            .attr('fill', 'oklch(0.65 0.20 145)')
            .attr('opacity', 0.1)
            .attr('stroke', 'oklch(0.65 0.20 145)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');
        }
      });
    }

    if (overlayData.lines) {
      overlayData.lines.forEach((line, idx) => {
        const x1Date = data[line.x1]?.date;
        const x2Date = data[line.x2]?.date;
        
        if (x1Date && x2Date) {
          overlayGroup
            .append('line')
            .attr('x1', x(new Date(x1Date)))
            .attr('y1', y(line.y1))
            .attr('x2', x(new Date(x2Date)))
            .attr('y2', y(line.y2))
            .attr('stroke', 'oklch(0.60 0.22 25)')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '6,3')
            .attr('opacity', 0.8);

          if (line.label) {
            const midX = (x(new Date(x1Date)) + x(new Date(x2Date))) / 2;
            const midY = (y(line.y1) + y(line.y2)) / 2;
            
            overlayGroup
              .append('text')
              .attr('x', midX)
              .attr('y', midY - 8)
              .attr('text-anchor', 'middle')
              .attr('fill', 'oklch(0.60 0.22 25)')
              .attr('font-size', '11px')
              .attr('font-weight', '600')
              .style('pointer-events', 'none')
              .text(line.label);
          }
        }
      });
    }

    if (overlayData.points) {
      overlayData.points.forEach(point => {
        const pointDate = data[point.x]?.date;
        
        if (pointDate) {
          overlayGroup
            .append('circle')
            .attr('cx', x(new Date(pointDate)))
            .attr('cy', y(point.y))
            .attr('r', 5)
            .attr('fill', 'oklch(0.60 0.22 25)')
            .attr('opacity', 0.8)
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

          if (point.label) {
            overlayGroup
              .append('text')
              .attr('x', x(new Date(pointDate)))
              .attr('y', y(point.y) - 12)
              .attr('text-anchor', 'middle')
              .attr('fill', 'oklch(0.60 0.22 25)')
              .attr('font-size', '10px')
              .attr('font-weight', '600')
              .style('pointer-events', 'none')
              .text(point.label);
          }
        }
      });
    }

  }, [highlightedPattern, data, dimensions]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full"
      />
    </div>
  );
}
